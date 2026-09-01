from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, UserRole


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying safe user profile details."""

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'role', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_active', 'created_at', 'updated_at')


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'},
        help_text='Minimum 6 characters.'
    )
    role = serializers.ChoiceField(
        choices=UserRole.choices,
        default=UserRole.USER,
        required=False
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'role', 'password')

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized_email

    def validate_name(self, value):
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return cleaned

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', UserRole.USER)
        
        # Staff users created through standard registration have is_staff=False by default (for django admin)
        # but role='STAFF' for application portal logic
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for authenticating users and generating JWT tokens."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = authenticate(email=email, password=password)
        if not user:
            # Check if user exists to provide helpful error
            if not User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError({"email": "No account found with this email."})
            else:
                raise serializers.ValidationError({"password": "Incorrect password. Please try again."})

        if not user.is_active:
            raise serializers.ValidationError("This user account has been disabled.")

        refresh = RefreshToken.for_user(user)
        
        # Custom claims in token
        refresh['name'] = user.name
        refresh['email'] = user.email
        refresh['role'] = user.role

        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
