from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db import connection

from accounts.models import User
from accounts.serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserDetailSerializer,
)
from accounts.permissions import IsAdminRole


class HealthCheckView(APIView):
    """Health check endpoint for system uptime and database connectivity."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_status = "healthy"

        try:
            connection.ensure_connection()
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"

        return Response({
            "status": "online",
            "service": "Smart Queue Management System API",
            "version": "1.0.0",
            "timestamp": timezone.now().isoformat(),
            "database": db_status
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """Register a new user account."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)

            refresh['name'] = user.name
            refresh['email'] = user.email
            refresh['role'] = user.role

            return Response({
                "message": "Account registered successfully!",
                "user": UserDetailSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            }, status=status.HTTP_201_CREATED)

        return Response({
            "message": "Registration failed. Please check the errors below.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Authenticate user and return JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']

            tokens = {
                'access': serializer.validated_data['access'],
                'refresh': serializer.validated_data['refresh'],
            }

            return Response({
                "message": "Login successful!",
                "user": UserDetailSerializer(user).data,
                "tokens": tokens,
            }, status=status.HTTP_200_OK)

        return Response({
            "message": "Invalid login credentials.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current authenticated user's profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserDetailSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """Invalidate refresh token upon logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {"message": "Logged out successfully (client state cleared)."},
                status=status.HTTP_200_OK
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Successfully logged out and token revoked."},
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"message": "Logged out successfully."},
                status=status.HTTP_200_OK
            )


class AdminUserListView(generics.ListAPIView):
    """
    Admin-only API for viewing all registered users.
    """

    permission_classes = [IsAdminRole]
    serializer_class = UserDetailSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-created_at')