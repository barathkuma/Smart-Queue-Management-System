from django.contrib import admin
from services.models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'prefix', 'average_service_time', 'is_active', 'created_at')
    list_filter = ('is_active', 'average_service_time')
    search_fields = ('name', 'prefix', 'description')
    ordering = ('name',)
