"""
Seed initial demo users for testing and quick-fill authentication.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, UserRole

def run_seed():
    print("[INFO] Seeding default demo accounts for Smart Queue...")
    
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
        status_txt = "Created" if created else "Updated"
        print(f"  * {status_txt} {acc['role']} -> {acc['email']} (Password: {acc['password']})")

    print("\n[SUCCESS] Seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
