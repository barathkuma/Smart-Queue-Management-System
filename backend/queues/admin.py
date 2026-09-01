from django.contrib import admin
from queues.models import QueueToken


@admin.register(QueueToken)
class QueueTokenAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'token_number',
        'service',
        'user',
        'status',
        'counter_number',
        'served_by',
        'joined_at',
        'called_at',
        'completed_at'
    )
    list_filter = ('status', 'service', 'counter_number', 'joined_at')
    search_fields = ('token_number', 'user__name', 'user__email', 'counter_number')
    ordering = ('-joined_at',)
    readonly_fields = ('joined_at',)
