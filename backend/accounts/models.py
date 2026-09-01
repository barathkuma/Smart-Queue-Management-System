from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserRole(models.TextChoices):
    USER = 'USER', 'User / Customer'
    STAFF = 'STAFF', 'Queue Staff'
    ADMIN = 'ADMIN', 'Administrator'


class UserManager(BaseUserManager):
    """Custom manager for accounts.User with email as unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email).lower()
        extra_fields.setdefault('role', UserRole.USER)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for Smart Queue Management System."""

    email = models.EmailField(
        verbose_name='Email Address',
        max_length=255,
        unique=True,
        db_index=True
    )
    name = models.CharField(max_length=150, verbose_name='Full Name')
    phone = models.CharField(max_length=25, blank=True, default='', verbose_name='Phone Number')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        db_index=True,
        verbose_name='Role'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Active Status')
    is_staff = models.BooleanField(default=False, verbose_name='Staff Status (Admin Panel Access)')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"

    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    @property
    def is_staff_role(self):
        return self.role == UserRole.STAFF

    @property
    def is_user_role(self):
        return self.role == UserRole.USER
