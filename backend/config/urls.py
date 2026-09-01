from django.contrib import admin
from django.urls import path, include
from accounts.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/auth/', include('accounts.urls')),
    path('api/services/', include('services.urls')),
    path('api/queue/', include('queues.urls')),
]
