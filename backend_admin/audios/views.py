from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Audio
from .serializers import (
    AudioSerializer, 
    AudioCreateSerializer, 
    AudioUpdateSerializer, 
    AudioListSerializer,
    UserSerializer
)

class PublicAudioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API for published audios - read-only access
    """
    queryset = Audio.objects.filter(is_public=True, published=True)
    serializer_class = AudioListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['genre', 'artist', 'year', 'is_featured']
    search_fields = ['title', 'description', 'artist', 'album']
    ordering_fields = ['created_at', 'title', 'artist', 'year']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'])
    def stream(self, request, pk=None):
        """Stream audio file"""
        audio = self.get_object()
        if audio.b2_download_url:
            return Response({'stream_url': audio.b2_download_url})
        elif audio.audio_file:
            return Response({'stream_url': request.build_absolute_uri(audio.audio_file.url)})
        return Response({'error': 'No audio file available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured audios"""
        featured_audios = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_audios, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest audios"""
        latest_audios = self.queryset.order_by('-created_at')[:10]
        serializer = self.get_serializer(latest_audios, many=True)
        return Response(serializer.data)

class AdminAudioViewSet(viewsets.ModelViewSet):
    """
    Admin API for audio management - full CRUD access
    """
    serializer_class = AudioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_public', 'is_featured', 'published', 'genre', 'artist', 'year']
    search_fields = ['title', 'description', 'artist', 'album']
    ordering_fields = ['created_at', 'title', 'artist', 'year']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return audios based on user permissions"""
        if self.request.user.is_staff:
            return Audio.objects.all()
        return Audio.objects.filter(uploaded_by=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return AudioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AudioUpdateSerializer
        elif self.action == 'list':
            return AudioListSerializer
        return AudioSerializer

    def perform_create(self, serializer):
        """Set uploaded_by to current user"""
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Get download URL for audio"""
        audio = self.get_object()
        if audio.b2_download_url:
            return Response({'download_url': audio.b2_download_url})
        elif audio.audio_file:
            return Response({'download_url': request.build_absolute_uri(audio.audio_file.url)})
        return Response({'error': 'No audio file available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_uploads(self, request):
        """Get current user's uploads"""
        my_audios = Audio.objects.filter(uploaded_by=request.user)
        serializer = self.get_serializer(my_audios, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status"""
        audio = self.get_object()
        audio.is_featured = not audio.is_featured
        audio.save()
        return Response({
            'id': audio.id,
            'is_featured': audio.is_featured,
            'message': f"Audio {'featured' if audio.is_featured else 'unfeatured'} successfully"
        })

    @action(detail=True, methods=['post'])
    def toggle_public(self, request, pk=None):
        """Toggle public status"""
        audio = self.get_object()
        audio.is_public = not audio.is_public
        audio.save()
        return Response({
            'id': audio.id,
            'is_public': audio.is_public,
            'message': f"Audio {'made public' if audio.is_public else 'made private'} successfully"
        })

    @action(detail=True, methods=['post'])
    def toggle_published(self, request, pk=None):
        """Toggle published status"""
        audio = self.get_object()
        audio.published = not audio.published
        audio.save()
        return Response({
            'id': audio.id,
            'published': audio.published,
            'message': f"Audio {'published' if audio.published else 'unpublished'} successfully"
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get audio statistics for admin dashboard"""
        if not request.user.is_staff:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        total_audios = Audio.objects.count()
        published_audios = Audio.objects.filter(published=True).count()
        featured_audios = Audio.objects.filter(is_featured=True).count()
        public_audios = Audio.objects.filter(is_public=True).count()
        
        # Recent uploads
        recent_uploads = Audio.objects.order_by('-created_at')[:5]
        recent_serializer = AudioListSerializer(recent_uploads, many=True)
        
        return Response({
            'total_audios': total_audios,
            'published_audios': published_audios,
            'featured_audios': featured_audios,
            'public_audios': public_audios,
            'recent_uploads': recent_serializer.data
        })
