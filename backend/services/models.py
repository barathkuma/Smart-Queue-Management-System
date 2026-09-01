from django.db import models
from django.utils import timezone


class Service(models.Model):
    """Department / Service category for queue allocation."""

    name = models.CharField(
        max_length=150,
        unique=True,
        db_index=True,
        verbose_name="Service Name"
    )
    prefix = models.CharField(
        max_length=5,
        default='A',
        help_text="Token code prefix (e.g. 'A' creates tokens like 'A-001', 'A-024')",
        verbose_name="Token Prefix"
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name="Service Description"
    )
    average_service_time = models.PositiveIntegerField(
        default=5,
        help_text="Average duration per customer in minutes",
        verbose_name="Avg Service Time (mins)"
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Is Active"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ['name']

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.name} ({self.prefix}) [{status}] - {self.average_service_time}m avg"
