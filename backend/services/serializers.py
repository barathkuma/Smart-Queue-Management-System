from rest_framework import serializers
from services.models import Service


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model."""
    
    active_tokens_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Service
        fields = (
            'id',
            'name',
            'prefix',
            'description',
            'average_service_time',
            'is_active',
            'active_tokens_count',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'active_tokens_count')

    def get_active_tokens_count(self, obj):
        # We can dynamically count WAITING/CALLED/SERVING tokens if queues app is loaded
        if hasattr(obj, 'queue_tokens'):
            return obj.queue_tokens.filter(status__in=['WAITING', 'CALLED', 'SERVING']).count()
        return 0

    def validate_prefix(self, value):
        cleaned = value.strip().upper()
        if not cleaned:
            return 'A'
        if not cleaned.isalnum():
            raise serializers.ValidationError("Prefix must contain alphanumeric characters only.")
        return cleaned

    def validate_name(self, value):
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise serializers.ValidationError("Service name must be at least 2 characters long.")
        return cleaned
