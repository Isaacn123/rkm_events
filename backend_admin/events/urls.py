from django.urls import path
from .views import RegisterEventsView, DashboardEventsListView, PublicEventsListView, EventsDetailView

urlpatterns = [
    path('create/', RegisterEventsView.as_view(), name='events'),
    path('dashboard/list/', DashboardEventsListView.as_view(), name='dashboard-events-list'),
    path('public/list/', PublicEventsListView.as_view(), name='public-events-list'),
    path('list/', DashboardEventsListView.as_view(), name='events-list'),  # Keep for backward compatibility
    path('<int:pk>/', EventsDetailView.as_view(), name='events-detail'),
]
