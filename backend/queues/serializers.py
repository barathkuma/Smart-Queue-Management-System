from rest_framework import serializers
from queues.models import QueueToken, QueueStatus
from queues.calculator import calculate_people_ahead, calculate_estimated_wait_time
from services.models import Service
from services.serializers import ServiceSerializer
from accounts.serializers import UserDetailSerializer


class QueueTokenSerializer(serializers.ModelSerializer):
    """Full detail serializer for Queue Tokens including live calculated wait estimates."""

    service = ServiceSerializer(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    served_by_name = serializers.CharField(source='served_by.name', read_only=True, default=None)
    people_ahead = serializers.SerializerMethodField(read_only=True)
    estimated_wait_time = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = QueueToken
        fields = (
            'id',
            'token_number',
            'user',
            'user_name',
            'user_email',
            'service',
            'status',
            'joined_at',
            'called_at',
            'started_at',
            'completed_at',
            'counter_number',
            'served_by',
            'served_by_name',
            'people_ahead',
            'estimated_wait_time',
        )
        read_only_fields = fields

    def get_people_ahead(self, obj) -> int:
        return calculate_people_ahead(obj)

    def get_estimated_wait_time(self, obj) -> int:
        ahead = calculate_people_ahead(obj)
        avg_time = obj.service.average_service_time if obj.service else 5
        return calculate_estimated_wait_time(ahead, avg_time)


class JoinQueueSerializer(serializers.Serializer):
    """Validates parameters for joining a service queue."""

    service_id = serializers.IntegerField(required=True)

    def validate_service_id(self, value):
        try:
            service = Service.objects.get(id=value)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Selected service does not exist.")

        if not service.is_active:
            raise serializers.ValidationError("This service department is currently inactive.")

        return value

    def validate(self, attrs):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required to join queue.")

        # Check for existing active token for this user
        has_active_token = QueueToken.objects.filter(
            user=user,
            status__in=[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SERVING]
        ).exists()

        if has_active_token:
            raise serializers.ValidationError(
                "You already have an active queue token. Please complete or cancel your current token before requesting a new one."
            )

        return attrs


class StaffCallNextSerializer(serializers.Serializer):
    """Input validation for Staff Call Next endpoint."""

    service_id = serializers.IntegerField(required=False, allow_null=True)
    counter_number = serializers.CharField(
        max_length=50,
        required=False,
        default='Counter 1',
        allow_blank=True
    )


class StaffTokenActionSerializer(serializers.Serializer):
    """Input validation for Staff Start/Complete/Skip/Recall actions."""

    token_id = serializers.IntegerField(required=False, allow_null=True)
    counter_number = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True
    )
