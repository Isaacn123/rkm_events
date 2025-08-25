from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicAudioViewSet, AdminAudioViewSet

# Public API router (read-only)
public_router = DefaultRouter()
public_router.register(r'public/audios', PublicAudioViewSet, basename='public-audio')

# Admin API router (full CRUD)
admin_router = DefaultRouter()
admin_router.register(r'admin/audios', AdminAudioViewSet, basename='admin-audio')

urlpatterns = [
    # Include both routers
    path('', include(public_router.urls)),
    path('', include(admin_router.urls)),
]
