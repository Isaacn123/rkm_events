from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import RegisterEventsSerializer
from .models import Events

# Create your views here.

class RegisterEventsView(generics.CreateAPIView):
    queryset = Events.objects.all()
    serializer_class = RegisterEventsSerializer
    permission_classes = [permissions.IsAuthenticated]

class DashboardEventsListView(generics.ListAPIView):
    """API for dashboard - returns all events (published and unpublished)"""
    queryset = Events.objects.all()
    serializer_class = RegisterEventsSerializer
    permission_classes = [permissions.IsAuthenticated]

class PublicEventsListView(generics.ListAPIView):
    """API for public - returns only published events"""
    queryset = Events.objects.filter(published=True)
    serializer_class = RegisterEventsSerializer
    permission_classes = [permissions.AllowAny]

class EventsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Events.objects.all()
    serializer_class = RegisterEventsSerializer
    permission_classes = [permissions.IsAuthenticated]


