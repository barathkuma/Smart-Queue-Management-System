from rest_framework.permissions import BasePermission
from accounts.models import UserRole


class IsAdminRole(BasePermission):
    """Allows access only to users with the ADMIN role or superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsStaffRole(BasePermission):
    """Allows access only to users with the STAFF role."""

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == UserRole.STAFF or request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsUserRole(BasePermission):
    """Allows access to authenticated USER role or general authenticated users."""

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated
        )


class IsStaffOrAdmin(BasePermission):
    """Allows access to either STAFF or ADMIN roles."""

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in [UserRole.STAFF, UserRole.ADMIN] or request.user.is_superuser)
        )
