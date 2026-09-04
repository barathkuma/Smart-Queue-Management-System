from django.urls import path
from queues.views import (
    JoinQueueView,
    MyTokenView,
    QueueStatusView,
    QueueHistoryView,
    CancelTokenView,
    CallNextView,
    StartServingView,
    CompleteServiceView,
    SkipTokenView,
    RecallTokenView,
    AnalyticsView
)

app_name = 'queues'

urlpatterns = [
    # Customer Queue Endpoints
    path('join/', JoinQueueView.as_view(), name='join_queue'),
    path('my-token/', MyTokenView.as_view(), name='my_token'),
    path('status/', QueueStatusView.as_view(), name='queue_status'),
    path('history/', QueueHistoryView.as_view(), name='queue_history'),
    path('cancel/', CancelTokenView.as_view(), name='cancel_token'),

    # Staff Queue Controls
    path('call-next/', CallNextView.as_view(), name='call_next'),
    path('start/', StartServingView.as_view(), name='start_serving'),
    path('complete/', CompleteServiceView.as_view(), name='complete_service'),
    path('skip/', SkipTokenView.as_view(), name='skip_token'),
    path('recall/', RecallTokenView.as_view(), name='recall_token'),
    path('analytics/', AnalyticsView.as_view(), name='queue_analytics'),
]
