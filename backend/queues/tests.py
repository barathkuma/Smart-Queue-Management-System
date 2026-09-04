from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User, UserRole
from services.models import Service
from queues.models import QueueToken, QueueStatus
from queues.calculator import calculate_people_ahead, calculate_estimated_wait_time, generate_token_number


class QueueUnitTests(TestCase):
    """Unit tests for calculation helpers and model properties."""

    def setUp(self):
        self.service = Service.objects.create(
            name='Test Service',
            prefix='T',
            average_service_time=6
        )
        self.user1 = User.objects.create_user(email='u1@test.com', name='User 1', password='p')
        self.user2 = User.objects.create_user(email='u2@test.com', name='User 2', password='p')
        self.user3 = User.objects.create_user(email='u3@test.com', name='User 3', password='p')

    def test_token_number_generation(self):
        t1 = generate_token_number(self.service)
        self.assertEqual(t1, 'T-001')

    def test_people_ahead_and_wait_time_calculation(self):
        now = timezone.now()
        token1 = QueueToken.objects.create(
            token_number='T-001',
            user=self.user1,
            service=self.service,
            status=QueueStatus.WAITING,
            joined_at=now - timedelta(minutes=5)
        )
        token2 = QueueToken.objects.create(
            token_number='T-002',
            user=self.user2,
            service=self.service,
            status=QueueStatus.WAITING,
            joined_at=now - timedelta(minutes=2)
        )
        token3 = QueueToken.objects.create(
            token_number='T-003',
            user=self.user3,
            service=self.service,
            status=QueueStatus.WAITING,
            joined_at=now
        )

        self.assertEqual(calculate_people_ahead(token1), 0)
        self.assertEqual(calculate_people_ahead(token2), 1)
        self.assertEqual(calculate_people_ahead(token3), 2)

        self.assertEqual(calculate_estimated_wait_time(0, 6), 0)
        self.assertEqual(calculate_estimated_wait_time(1, 6), 6)
        self.assertEqual(calculate_estimated_wait_time(2, 6), 12)


class QueueAPITests(APITestCase):
    """Integration tests for customer and staff queue endpoints."""

    def setUp(self):
        self.service_a = Service.objects.create(
            name='General Consultation',
            prefix='A',
            average_service_time=5,
            is_active=True
        )
        self.service_inactive = Service.objects.create(
            name='Closed Desk',
            prefix='X',
            average_service_time=10,
            is_active=False
        )

        self.customer1 = User.objects.create_user(
            email='customer1@smartqueue.com',
            name='Alice Customer',
            password='password123',
            role=UserRole.USER
        )
        self.customer2 = User.objects.create_user(
            email='customer2@smartqueue.com',
            name='Bob Customer',
            password='password123',
            role=UserRole.USER
        )
        self.staff_member = User.objects.create_user(
            email='staff@smartqueue.com',
            name='Sarah Staff',
            password='password123',
            role=UserRole.STAFF
        )

        self.join_url = reverse('queues:join_queue')
        self.my_token_url = reverse('queues:my_token')
        self.status_url = reverse('queues:queue_status')
        self.history_url = reverse('queues:queue_history')
        self.cancel_url = reverse('queues:cancel_token')

        self.call_next_url = reverse('queues:call_next')
        self.start_url = reverse('queues:start_serving')
        self.complete_url = reverse('queues:complete_service')
        self.skip_url = reverse('queues:skip_token')
        self.recall_url = reverse('queues:recall_token')

    def test_customer_join_queue_success(self):
        self.client.force_authenticate(user=self.customer1)
        response = self.client.post(self.join_url, {'service_id': self.service_a.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['token_number'], 'A-001')
        self.assertEqual(response.data['people_ahead'], 0)
        self.assertEqual(response.data['estimated_wait_time'], 0)
        self.assertEqual(response.data['status'], 'WAITING')

    def test_customer_cannot_join_inactive_service(self):
        self.client.force_authenticate(user=self.customer1)
        response = self.client.post(self.join_url, {'service_id': self.service_inactive.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_active_token_prevention(self):
        self.client.force_authenticate(user=self.customer1)
        # First join succeeds
        res1 = self.client.post(self.join_url, {'service_id': self.service_a.id}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Second join fails
        res2 = self.client.post(self.join_url, {'service_id': self.service_a.id}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('active queue token', str(res2.data))

    def test_multiple_customers_people_ahead_calculation(self):
        # Customer 1 joins
        self.client.force_authenticate(user=self.customer1)
        res1 = self.client.post(self.join_url, {'service_id': self.service_a.id})
        self.assertEqual(res1.data['token_number'], 'A-001')
        self.assertEqual(res1.data['people_ahead'], 0)

        # Customer 2 joins
        self.client.force_authenticate(user=self.customer2)
        res2 = self.client.post(self.join_url, {'service_id': self.service_a.id})
        self.assertEqual(res2.data['token_number'], 'A-002')
        self.assertEqual(res2.data['people_ahead'], 1)
        self.assertEqual(res2.data['estimated_wait_time'], 5)

    def test_get_my_token(self):
        self.client.force_authenticate(user=self.customer1)
        # Initially none
        res0 = self.client.get(self.my_token_url)
        self.assertEqual(res0.status_code, status.HTTP_200_OK)
        self.assertIsNone(res0.data['active_token'])

        # After join
        self.client.post(self.join_url, {'service_id': self.service_a.id})
        res1 = self.client.get(self.my_token_url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(res1.data['active_token'])
        self.assertEqual(res1.data['active_token']['token_number'], 'A-001')

    def test_cancel_my_token(self):
        self.client.force_authenticate(user=self.customer1)
        self.client.post(self.join_url, {'service_id': self.service_a.id})
        
        cancel_res = self.client.post(self.cancel_url)
        self.assertEqual(cancel_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_res.data['token']['status'], 'CANCELLED')

        # Now can join again since previous is cancelled
        join_again = self.client.post(self.join_url, {'service_id': self.service_a.id})
        self.assertEqual(join_again.status_code, status.HTTP_201_CREATED)

    def test_staff_controls_full_lifecycle(self):
        # 1. Customers join
        self.client.force_authenticate(user=self.customer1)
        self.client.post(self.join_url, {'service_id': self.service_a.id})

        self.client.force_authenticate(user=self.customer2)
        self.client.post(self.join_url, {'service_id': self.service_a.id})

        # 2. Customer trying to call next -> 403 Forbidden
        staff_fail = self.client.post(self.call_next_url, {'counter_number': 'Counter 1'})
        self.assertEqual(staff_fail.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff calling next (FIFO should return customer 1's token A-001)
        self.client.force_authenticate(user=self.staff_member)
        call_res = self.client.post(self.call_next_url, {
            'service_id': self.service_a.id,
            'counter_number': 'Counter 1'
        })
        self.assertEqual(call_res.status_code, status.HTTP_200_OK)
        self.assertEqual(call_res.data['token']['token_number'], 'A-001')
        self.assertEqual(call_res.data['token']['status'], 'CALLED')
        self.assertEqual(call_res.data['token']['counter_number'], 'Counter 1')

        token_id = call_res.data['token']['id']

        # 4. Staff start serving
        start_res = self.client.post(self.start_url, {'token_id': token_id})
        self.assertEqual(start_res.status_code, status.HTTP_200_OK)
        self.assertEqual(start_res.data['token']['status'], 'SERVING')

        # 5. Staff complete service
        complete_res = self.client.post(self.complete_url, {'token_id': token_id})
        self.assertEqual(complete_res.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_res.data['token']['status'], 'COMPLETED')

        # 6. Staff calls next customer (should now be A-002)
        call2_res = self.client.post(self.call_next_url, {
            'service_id': self.service_a.id,
            'counter_number': 'Counter 1'
        })
        self.assertEqual(call2_res.data['token']['token_number'], 'A-002')

        # 7. Staff skips customer 2
        skip_res = self.client.post(self.skip_url, {'token_id': call2_res.data['token']['id']})
        self.assertEqual(skip_res.status_code, status.HTTP_200_OK)
        self.assertEqual(skip_res.data['token']['status'], 'SKIPPED')

        # 8. Staff recalls customer 2
        recall_res = self.client.post(self.recall_url, {'token_id': call2_res.data['token']['id']})
        self.assertEqual(recall_res.status_code, status.HTTP_200_OK)
        self.assertEqual(recall_res.data['token']['status'], 'CALLED')

    def test_admin_analytics_access(self):
        # Create an admin user
        admin_user = User.objects.create_user(
            email='admin@smartqueue.com',
            name='Admin User',
            password='password123',
            role=UserRole.ADMIN
        )
        analytics_url = reverse('queues:queue_analytics')

        # 1. Admin can access
        self.client.force_authenticate(user=admin_user)
        res_admin = self.client.get(analytics_url)
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)

        # 2. Customer cannot access
        self.client.force_authenticate(user=self.customer1)
        res_cust = self.client.get(analytics_url)
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

    def test_analytics_data_accuracy(self):
        # Setup data for analytics
        admin_user = User.objects.create_user(
            email='admin2@smartqueue.com',
            name='Admin 2',
            password='password123',
            role=UserRole.ADMIN
        )
        self.client.force_authenticate(user=admin_user)
        analytics_url = reverse('queues:queue_analytics')

        # Create a completed token to test avg wait time
        now = timezone.now()
        QueueToken.objects.create(
            token_number='A-100',
            user=self.customer1,
            service=self.service_a,
            status=QueueStatus.COMPLETED,
            joined_at=now - timedelta(minutes=20),
            completed_at=now # wait time = 20 min
        )

        res = self.client.get(analytics_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Check if A-001 (General Consultation) has avg_wait_time = 20
        wait_metrics = res.data['avg_wait_times']
        service_metric = next((m for m in wait_metrics if m['service'] == self.service_a.name), None)
        self.assertIsNotNone(service_metric)
        self.assertEqual(service_metric['avg_wait_time'], 20)

