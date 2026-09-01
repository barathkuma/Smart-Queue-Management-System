from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User, UserRole
from accounts.permissions import IsAdminRole, IsStaffRole, IsUserRole, IsStaffOrAdmin


class UserModelTests(TestCase):
    """Test custom User model creation and validation."""

    def test_create_user_successful(self):
        user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            phone='+1234567890',
            password='securepassword123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.role, UserRole.USER)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password('securepassword123'))

    def test_create_superuser_successful(self):
        admin = User.objects.create_superuser(
            email='admin@example.com',
            name='System Admin',
            password='adminpassword123'
        )
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertEqual(admin.role, UserRole.ADMIN)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_admin_role)

    def test_email_normalized_and_lowercased(self):
        user = User.objects.create_user(
            email='CAPS.Email@Example.COM',
            name='Caps User',
            password='password123'
        )
        self.assertEqual(user.email, 'caps.email@example.com')


class AuthAPITests(APITestCase):
    """Test REST API Auth endpoints (register, login, me, refresh, logout)."""

    def setUp(self):
        self.register_url = reverse('accounts:register')
        self.login_url = reverse('accounts:login')
        self.refresh_url = reverse('accounts:token_refresh')
        self.me_url = reverse('accounts:user_profile')
        self.logout_url = reverse('accounts:logout')

        self.user_data = {
            'email': 'customer@smartqueue.com',
            'name': 'John Doe',
            'phone': '+1987654321',
            'password': 'password123',
            'role': 'USER'
        }
        self.user = User.objects.create_user(
            email='existing@smartqueue.com',
            name='Existing User',
            password='existingpass123',
            role=UserRole.USER
        )

    def test_register_new_user(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'customer@smartqueue.com')
        self.assertEqual(response.data['user']['role'], 'USER')

    def test_register_duplicate_email_fails(self):
        duplicate_data = {
            'email': 'existing@smartqueue.com',
            'name': 'Duplicate User',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)

    def test_login_success(self):
        login_payload = {
            'email': 'existing@smartqueue.com',
            'password': 'existingpass123'
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'existing@smartqueue.com')

    def test_login_invalid_password_fails(self):
        login_payload = {
            'email': 'existing@smartqueue.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_profile_authenticated(self):
        # Obtain token
        login_res = self.client.post(self.login_url, {
            'email': 'existing@smartqueue.com',
            'password': 'existingpass123'
        })
        access_token = login_res.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'existing@smartqueue.com')

    def test_get_user_profile_unauthenticated_fails(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        login_res = self.client.post(self.login_url, {
            'email': 'existing@smartqueue.com',
            'password': 'existingpass123'
        })
        refresh_token = login_res.data['tokens']['refresh']

        response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class PermissionsTests(TestCase):
    """Test custom role-based permission classes."""

    def setUp(self):
        self.user = User.objects.create_user(email='user@test.com', name='User', password='p', role=UserRole.USER)
        self.staff = User.objects.create_user(email='staff@test.com', name='Staff', password='p', role=UserRole.STAFF)
        self.admin = User.objects.create_user(email='admin@test.com', name='Admin', password='p', role=UserRole.ADMIN)

    class MockRequest:
        def __init__(self, user):
            self.user = user

    def test_is_admin_permission(self):
        perm = IsAdminRole()
        self.assertFalse(perm.has_permission(self.MockRequest(self.user), None))
        self.assertFalse(perm.has_permission(self.MockRequest(self.staff), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.admin), None))

    def test_is_staff_permission(self):
        perm = IsStaffRole()
        self.assertFalse(perm.has_permission(self.MockRequest(self.user), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.staff), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.admin), None))

    def test_is_staff_or_admin(self):
        perm = IsStaffOrAdmin()
        self.assertFalse(perm.has_permission(self.MockRequest(self.user), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.staff), None))
        self.assertTrue(perm.has_permission(self.MockRequest(self.admin), None))
