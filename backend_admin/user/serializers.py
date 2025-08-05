from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import UserProfile, Role

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserProfileSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['role']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name', 'date_joined', 'is_active', 'profile')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
               username=validated_data['username'],
               email=validated_data['email'],
               password=validated_data['password']
        )
        return user



