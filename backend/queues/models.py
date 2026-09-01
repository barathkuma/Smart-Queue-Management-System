from django.db import models
from django.conf import settings
from django.utils import timezone


class QueueStatus(models.TextChoices):
    WAITING = 'WAITING', 'Waiting in Queue'
    CALLED = 'CALLED', 'Called to Counter'
    SERVING = 'SERVING', 'Currently Serving'
    COMPLETED = 'COMPLETED', 'Service Completed'
    SKIPPED = 'SKIPPED', 'Customer Skipped / Absent'
    CANCELLED = 'CANCELLED', 'Cancelled by User'


class QueueToken(models.Model):
    """Represents a virtual queue token entry in the Smart Queue system."""

    token_number = models.CharField(
        max_length=30,
        db_index=True,
        verbose_name="Token Number"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queue_tokens',
        verbose_name="Customer User"
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.CASCADE,
        related_name='queue_tokens',
        verbose_name="Service Department"
    )
    status = models.CharField(
        max_length=20,
        choices=QueueStatus.choices,
        default=QueueStatus.WAITING,
        db_index=True,
        verbose_name="Status"
    )
    joined_at = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        verbose_name="Joined At"
    )
    called_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Called At"
    )
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Started At"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Completed At"
    )
    counter_number = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Assigned Counter"
    )
    served_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='served_tokens',
        verbose_name="Staff Member"
    )

    class Meta:
        verbose_name = "Queue Token"
        verbose_name_plural = "Queue Tokens"
        ordering = ['joined_at']
        indexes = [
            models.Index(fields=['service', 'status', 'joined_at']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'joined_at']),
        ]

    def __str__(self):
        return f"Token {self.token_number} - {self.service.name} [{self.status}]"

    @property
    def is_active(self):
        return self.status in [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SERVING]
