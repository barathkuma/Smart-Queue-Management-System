from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User, UserRole
from services.models import Service


class ServiceAPITests(APITestCase):
    """Test suite for Service API endpoints and role permissions."""

    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            name='Admin User',
            password='adminpassword123'
        )
        self.user = User.objects.create_user(
            email='user@test.com',
            name='Customer User',
            password='userpassword123',
            role=UserRole.USER
        )
        self.staff = User.objects.create_user(
            email='staff@test.com',
            name='Staff User',
            password='staffpassword123',
            role=UserRole.STAFF
        )

        self.service1 = Service.objects.create(
            name='General Consultation',
            prefix='A',
            average_service_time=5,
            is_active=True
        )
        self.service_inactive = Service.objects.create(
            name='Archived Service',
            prefix='Z',
            average_service_time=15,
            is_active=False
        )

        self.list_url = reverse('services:service_list_create')

    def test_list_services_as_normal_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Normal user only sees active services
        service_names = [s['name'] for s in response.data]
        self.assertIn('General Consultation', service_names)
        self.assertNotIn('Archived Service', service_names)

    def test_list_all_services_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"{self.list_url}?all=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        service_names = [s['name'] for s in response.data]
        self.assertIn('General Consultation', service_names)
        self.assertIn('Archived Service', service_names)

    def test_create_service_as_admin_success(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Priority Express Desk',
            'prefix': 'E',
            'average_service_time': 3,
            'description': 'Rapid clearance desk for simple inquiries.',
            'is_active': True
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Priority Express Desk')
        self.assertEqual(response.data['prefix'], 'E')

    def test_create_service_as_customer_forbidden(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'name': 'Unauthorized Desk',
            'prefix': 'U',
            'average_service_time': 5
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_service_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        detail_url = reverse('services:service_detail', kwargs={'pk': self.service1.id})
        response = self.client.patch(detail_url, {'average_service_time': 7}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['average_service_time'], 7)

    def test_delete_service_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        detail_url = reverse('services:service_detail', kwargs={'pk': self.service1.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=self.service1.id).exists())
