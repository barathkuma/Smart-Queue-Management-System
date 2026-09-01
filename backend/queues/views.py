from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from queues.models import QueueToken, QueueStatus
from queues.serializers import (
    QueueTokenSerializer,
    JoinQueueSerializer,
    StaffCallNextSerializer,
    StaffTokenActionSerializer
)
from queues.calculator import (
    calculate_people_ahead,
    calculate_estimated_wait_time,
    generate_token_number
)
from services.models import Service
from accounts.permissions import IsStaffOrAdmin


class JoinQueueView(APIView):
    """
    POST /api/queue/join/
    Allows authenticated users to join a service queue and generate a virtual token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JoinQueueSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response({
                "message": "Unable to join queue.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        service_id = serializer.validated_data['service_id']
        service = Service.objects.get(id=service_id)

        with transaction.atomic():
            token_number = generate_token_number(service)

            token = QueueToken.objects.create(
                token_number=token_number,
                user=request.user,
                service=service,
                status=QueueStatus.WAITING,
                joined_at=timezone.now()
            )

        people_ahead = calculate_people_ahead(token)
        estimated_wait = calculate_estimated_wait_time(
            people_ahead,
            service.average_service_time
        )

        token_data = QueueTokenSerializer(token).data

        return Response({
            "message": f"Successfully joined queue for {service.name}!",
            "token": token_data,
            "token_number": token.token_number,
            "people_ahead": people_ahead,
            "estimated_wait_time": estimated_wait,
            "status": token.status
        }, status=status.HTTP_201_CREATED)


class MyTokenView(APIView):
    """
    GET /api/queue/my-token/
    Returns the currently active queue token for the authenticated customer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_token = QueueToken.objects.filter(
            user=request.user,
            status__in=[
                QueueStatus.WAITING,
                QueueStatus.CALLED,
                QueueStatus.SERVING
            ]
        ).select_related(
            'service',
            'user',
            'served_by'
        ).first()

        if not active_token:
            return Response({
                "active_token": None,
                "message": "You do not have any active queue tokens."
            }, status=status.HTTP_200_OK)

        return Response({
            "active_token": QueueTokenSerializer(active_token).data
        }, status=status.HTTP_200_OK)


class QueueStatusView(APIView):
    """
    GET /api/queue/status/
    Returns overall queue summary for all services
    + current user's active token if any.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        # User active token
        active_token = QueueToken.objects.filter(
            user=request.user,
            status__in=[
                QueueStatus.WAITING,
                QueueStatus.CALLED,
                QueueStatus.SERVING
            ]
        ).select_related(
            'service',
            'user',
            'served_by'
        ).first()

        # Services queue breakdown
        services = Service.objects.filter(is_active=True)
        services_status = []

        for svc in services:

            waiting_count = QueueToken.objects.filter(
                service=svc,
                status=QueueStatus.WAITING
            ).count()

            current_serving = QueueToken.objects.filter(
                service=svc,
                status__in=[
                    QueueStatus.CALLED,
                    QueueStatus.SERVING
                ]
            ).order_by('-called_at').first()

            services_status.append({
                "id": svc.id,
                "name": svc.name,
                "prefix": svc.prefix,
                "average_service_time": svc.average_service_time,
                "waiting_count": waiting_count,
                "currently_serving_token":
                    current_serving.token_number
                    if current_serving else None,
                "currently_serving_counter":
                    current_serving.counter_number
                    if current_serving else None,
                "estimated_total_queue_time":
                    waiting_count * svc.average_service_time
            })

        return Response({
            "user_token":
                QueueTokenSerializer(active_token).data
                if active_token else None,
            "services": services_status,
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK)


class QueueHistoryView(APIView):
    """
    GET /api/queue/history/
    Returns the past token history for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        history_tokens = QueueToken.objects.filter(
            user=request.user,
            status__in=[
                QueueStatus.COMPLETED,
                QueueStatus.SKIPPED,
                QueueStatus.CANCELLED
            ]
        ).select_related(
            'service',
            'served_by'
        ).order_by('-joined_at')[:50]

        return Response({
            "count": len(history_tokens),
            "history":
                QueueTokenSerializer(
                    history_tokens,
                    many=True
                ).data
        }, status=status.HTTP_200_OK)


class CancelTokenView(APIView):
    """
    POST /api/queue/cancel/
    Allows customer to cancel their active waiting token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        token_id = request.data.get('token_id')

        query = QueueToken.objects.filter(
            user=request.user,
            status__in=[
                QueueStatus.WAITING,
                QueueStatus.CALLED
            ]
        )

        if token_id:
            query = query.filter(id=token_id)

        token = query.first()

        if not token:
            return Response({
                "message": "No active or cancellable queue token found."
            }, status=status.HTTP_404_NOT_FOUND)

        token.status = QueueStatus.CANCELLED
        token.completed_at = timezone.now()

        token.save(
            update_fields=[
                'status',
                'completed_at'
            ]
        )

        return Response({
            "message":
                f"Token {token.token_number} has been cancelled.",
            "token":
                QueueTokenSerializer(token).data
        }, status=status.HTTP_200_OK)


# ==========================================
# Staff Queue Controls
# ==========================================


class CallNextView(APIView):
    """
    POST /api/queue/call-next/

    Staff picks the next waiting token in strict FIFO order
    using joined_at.

    Uses row-level locking to prevent race conditions.
    """
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):

        serializer = StaffCallNextSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        service_id = serializer.validated_data.get(
            'service_id'
        )

        counter_number = serializer.validated_data.get(
            'counter_number',
            'Counter 1'
        )

        with transaction.atomic():

            query = QueueToken.objects.select_for_update(
                skip_locked=True
            ).filter(
                status=QueueStatus.WAITING
            )

            if service_id:
                query = query.filter(
                    service_id=service_id
                )

            # Strict FIFO order
            next_token = query.order_by(
                'joined_at'
            ).first()

            if not next_token:
                return Response({
                    "message":
                        "No waiting customers in the queue.",
                    "token": None
                }, status=status.HTTP_200_OK)

            next_token.status = QueueStatus.CALLED
            next_token.called_at = timezone.now()
            next_token.counter_number = counter_number
            next_token.served_by = request.user

            next_token.save()

        return Response({
            "message":
                f"Calling Token {next_token.token_number} "
                f"to {counter_number}!",
            "token":
                QueueTokenSerializer(next_token).data
        }, status=status.HTTP_200_OK)


class StartServingView(APIView):
    """
    POST /api/queue/start/

    Staff marks a CALLED customer as currently being served.
    """
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):

        serializer = StaffTokenActionSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_id = serializer.validated_data.get(
            'token_id'
        )

        query = QueueToken.objects.filter(
            status=QueueStatus.CALLED
        )

        if token_id:
            query = query.filter(
                id=token_id
            )
        else:
            query = query.filter(
                served_by=request.user
            ).order_by(
                '-called_at'
            )

        token = query.first()

        if not token:
            return Response({
                "message":
                    "No called token found ready to start serving."
            }, status=status.HTTP_404_NOT_FOUND)

        token.status = QueueStatus.SERVING
        token.started_at = timezone.now()

        token.save(
            update_fields=[
                'status',
                'started_at'
            ]
        )

        return Response({
            "message":
                f"Started serving Token {token.token_number}.",
            "token":
                QueueTokenSerializer(token).data
        }, status=status.HTTP_200_OK)


class CompleteServiceView(APIView):
    """
    POST /api/queue/complete/

    Staff marks an active customer service as completed.
    """
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):

        serializer = StaffTokenActionSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_id = serializer.validated_data.get(
            'token_id'
        )

        query = QueueToken.objects.filter(
            status__in=[
                QueueStatus.SERVING,
                QueueStatus.CALLED
            ]
        )

        if token_id:
            query = query.filter(
                id=token_id
            )
        else:
            query = query.filter(
                served_by=request.user
            ).order_by(
                '-called_at'
            )

        token = query.first()

        if not token:
            return Response({
                "message":
                    "No active token found to complete."
            }, status=status.HTTP_404_NOT_FOUND)

        token.status = QueueStatus.COMPLETED
        token.completed_at = timezone.now()

        token.save(
            update_fields=[
                'status',
                'completed_at'
            ]
        )

        return Response({
            "message":
                f"Service for Token {token.token_number} "
                f"completed successfully!",
            "token":
                QueueTokenSerializer(token).data
        }, status=status.HTTP_200_OK)


class SkipTokenView(APIView):
    """
    POST /api/queue/skip/

    Staff marks a CALLED customer as absent / skipped.
    """
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):

        serializer = StaffTokenActionSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_id = serializer.validated_data.get(
            'token_id'
        )

        query = QueueToken.objects.filter(
            status=QueueStatus.CALLED
        )

        if token_id:
            query = query.filter(
                id=token_id
            )
        else:
            query = query.filter(
                served_by=request.user
            ).order_by(
                '-called_at'
            )

        token = query.first()

        if not token:
            return Response({
                "message":
                    "No called token found to skip."
            }, status=status.HTTP_404_NOT_FOUND)

        token.status = QueueStatus.SKIPPED
        token.completed_at = timezone.now()

        token.save(
            update_fields=[
                'status',
                'completed_at'
            ]
        )

        return Response({
            "message":
                f"Token {token.token_number} "
                f"has been marked as skipped.",
            "token":
                QueueTokenSerializer(token).data
        }, status=status.HTTP_200_OK)


class RecallTokenView(APIView):
    """
    POST /api/queue/recall/

    Staff re-announces / recalls a customer to the counter.

    IMPORTANT:
    When a skipped token is recalled, completed_at is cleared
    because the token becomes active again.
    """
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):

        serializer = StaffTokenActionSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        token_id = serializer.validated_data.get(
            'token_id'
        )

        counter_number = serializer.validated_data.get(
            'counter_number'
        )

        query = QueueToken.objects.filter(
            status__in=[
                QueueStatus.CALLED,
                QueueStatus.SKIPPED
            ]
        )

        if token_id:
            query = query.filter(
                id=token_id
            )
        else:
            query = query.filter(
                served_by=request.user
            ).order_by(
                '-called_at'
            )

        token = query.first()

        if not token:
            return Response({
                "message":
                    "No token found to recall."
            }, status=status.HTTP_404_NOT_FOUND)

        # Recall the token
        token.status = QueueStatus.CALLED
        token.called_at = timezone.now()

        # IMPORTANT:
        # A recalled token is active again,
        # so completed_at must be cleared.
        token.completed_at = None

        if counter_number:
            token.counter_number = counter_number

        token.save(
            update_fields=[
                'status',
                'called_at',
                'completed_at',
                'counter_number'
            ]
        )

        return Response({
            "message":
                f"Recalled Token {token.token_number} "
                f"to {token.counter_number}!",
            "token":
                QueueTokenSerializer(token).data
        }, status=status.HTTP_200_OK)