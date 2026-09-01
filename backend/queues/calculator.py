"""
Reusable Queue Calculation Engine
Modular business logic for queue position, wait-time estimation, and token sequence generation.
"""
from django.utils import timezone
from queues.models import QueueStatus


def calculate_people_ahead(token) -> int:
    """
    Calculate the number of customers currently waiting ahead of this token
    in the same service queue based strictly on joined_at FIFO ordering.
    """
    from queues.models import QueueToken
    
    if token.status != QueueStatus.WAITING:
        return 0

    return QueueToken.objects.filter(
        service=token.service,
        status=QueueStatus.WAITING,
        joined_at__lt=token.joined_at
    ).exclude(id=token.id).count()


def calculate_estimated_wait_time(people_ahead: int, average_service_time: int) -> int:
    """
    Standard deterministic wait-time calculation formula:
    estimated_wait_time = people_ahead * average_service_time (in minutes).
    
    Note: Structured modularly so an advanced ML latency regression model 
    can seamlessly replace this calculation without modifying API views.
    """
    if people_ahead <= 0:
        return 0
    return int(people_ahead * max(average_service_time, 1))


def generate_token_number(service) -> str:
    """
    Generate a formatted unique token number for a service.
    Example output: 'A-001', 'A-024', 'B-105'.
    Uses service prefix and monotonic token count for the service.
    """
    from queues.models import QueueToken

    prefix = (service.prefix or 'A').upper().strip()
    
    # Monotonic increment based on total tokens created for this service
    total_existing = QueueToken.objects.filter(service=service).count()
    sequence_number = total_existing + 1
    
    return f"{prefix}-{sequence_number:03d}"
