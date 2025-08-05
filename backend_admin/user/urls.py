
from django.urls import path
from .views import RegisterUserView, UserListView, UserDetailView, login_view, verify_token_view, refresh_token_view


urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('verify/', verify_token_view, name='verify-token'),
    path('refresh/', refresh_token_view, name='refresh-token'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]