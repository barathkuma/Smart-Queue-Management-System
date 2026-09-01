"""
Django Management Command: python manage.py seed_data
Seeds default demo services, counter users, and initial queue records.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from accounts.models import User, UserRole
from services.models import Service
from queues.models import QueueToken, QueueStatus


class Command(BaseCommand):
    help = "Seed demo services, users, and initial queue tokens for Smart Queue"

    def handle(self, *args, **options):
        self.stdout.write("[INFO] Starting Smart Queue database seeding...")

        # 1. Seed Demo Services
        demo_services = [
            {
                "name": "General Consultation",
                "prefix": "A",
                "average_service_time": 5,
                "description": "General walk-in consultation, advice, and inquiry services.",
                "is_active": True
            },
            {
                "name": "Billing & Payments",
                "prefix": "B",
                "average_service_time": 4,
                "description": "Account settlement, fee processing, invoicing, and payment queries.",
                "is_active": True
            },
            {
                "name": "Customer Service",
                "prefix": "C",
                "average_service_time": 6,
                "description": "General customer care, grievance resolution, and account upgrades.",
                "is_active": True
            },
            {
                "name": "Document Verification",
                "prefix": "D",
                "average_service_time": 8,
                "description": "Identity verification, document clearance, and certificate validation.",
                "is_active": True
            },
            {
                "name": "Technical Support",
                "prefix": "T",
                "average_service_time": 10,
                "description": "Hardware diagnostics, technical debugging, and system configuration.",
                "is_active": True
            }
        ]

        created_services = {}
        for s_data in demo_services:
            service, created = Service.objects.get_or_create(
                name=s_data["name"],
                defaults={
                    "prefix": s_data["prefix"],
                    "average_service_time": s_data["average_service_time"],
                    "description": s_data["description"],
                    "is_active": s_data["is_active"],
                }
            )
            created_services[service.prefix] = service
            status_txt = "Created" if created else "Existing"
            self.stdout.write(f"  * Service {status_txt}: {service.name} [{service.prefix}]")

        # 2. Seed Default Accounts
        demo_accounts = [
            {
                "email": "user@smartqueue.com",
                "name": "Alex Customer",
                "phone": "+1 555 0192",
                "password": "Password123!",
                "role": UserRole.USER,
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "email": "staff@smartqueue.com",
                "name": "Sarah Counter-Staff",
                "phone": "+1 555 0148",
                "password": "Password123!",
                "role": UserRole.STAFF,
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "email": "admin@smartqueue.com",
                "name": "David System-Admin",
                "phone": "+1 555 0100",
                "password": "Password123!",
                "role": UserRole.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            }
        ]

        created_users = {}
        for acc in demo_accounts:
            user, created = User.objects.get_or_create(
                email=acc["email"],
                defaults={
                    "name": acc["name"],
                    "phone": acc["phone"],
                    "role": acc["role"],
                    "is_staff": acc["is_staff"],
                    "is_superuser": acc["is_superuser"],
                }
            )
            user.set_password(acc["password"])
            user.name = acc["name"]
            user.phone = acc["phone"]
            user.role = acc["role"]
            user.is_staff = acc["is_staff"]
            user.is_superuser = acc["is_superuser"]
            user.save()
            created_users[acc["role"]] = user
            status_txt = "Created" if created else "Updated"
            self.stdout.write(f"  * User {status_txt}: {acc['role']} -> {acc['email']}")

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Seed data completed successfully!"))
