from rest_framework import generics, permissions, status
from rest_framework.response import Response
from services.models import Service
from services.serializers import ServiceSerializer
from accounts.permissions import IsAdminRole, IsStaffOrAdmin


class ServiceListCreateView(generics.ListCreateAPIView):
    """
    GET: List active services for authenticated users (Admins see all).
    POST: Create a new service (Admin only).
    """
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Service.objects.all()
        
        # If user is admin/staff and requests all, show all. Otherwise show active services.
        show_all = self.request.query_params.get('all', 'false').lower() in ('true', '1')
        if (user.is_authenticated and (user.is_admin_role or user.is_staff_role)) and show_all:
            return queryset
        
        # Non-admins or default list only returns active services
        if not (user.is_authenticated and user.is_admin_role):
            queryset = queryset.filter(is_active=True)
            
        return queryset


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve service details.
    PUT/PATCH: Update service (Admin only).
    DELETE: Remove service (Admin only).
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]
