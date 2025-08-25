from rest_framework import serializers
from .models import Audio
from events.serializers import RegisterEventsSerializer
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class AudioSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    related_events = RegisterEventsSerializer(many=True, read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    duration_formatted = serializers.ReadOnlyField()
    
    # Override audio_file to handle both FileField and URLField
    audio_file = serializers.SerializerMethodField()
    
    def get_audio_file(self, obj):
        # Return B2 URL if available, otherwise return the file field
        if obj.b2_download_url:
            return obj.b2_download_url
        return obj.audio_file.url if obj.audio_file else None
    
    class Meta:
        model = Audio
        fields = [
            'id', 'title', 'description', 'audio_file', 'cover_image', 'cover_image_name',
            'b2_file_name', 'b2_file_id', 'b2_download_url', 'duration', 'file_size', 
            'file_size_mb', 'format', 'artist', 'album', 'genre', 'year', 'is_public', 
            'is_featured', 'published', 'uploaded_by', 'related_events', 'created_at', 
            'updated_at', 'duration_formatted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_size', 'file_size_mb']

class AudioCreateSerializer(serializers.ModelSerializer):
    cover_image_file = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = Audio
        fields = [
            'title', 'description', 'audio_file', 'cover_image_file', 'artist', 'album',
            'genre', 'year', 'is_public', 'is_featured', 'published', 'related_events'
        ]
    
    def create(self, validated_data):
        # Extract cover image file
        cover_image_file = validated_data.pop('cover_image_file', None)
        
        # Set the uploaded_by field to the current user
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Create the audio instance
        audio = super().create(validated_data)
        
        # Upload audio file to Backblaze B2
        if audio.audio_file:
            print(f"Uploading audio file '{audio.audio_file.name}' to Backblaze B2...")
            success = audio.upload_audio_to_backblaze(audio.audio_file)
            if success:
                print(f"✅ Audio uploaded to B2 successfully!")
            else:
                print(f"❌ Audio upload to B2 failed!")
        
        # Upload cover image to ImgBB if provided
        if cover_image_file:
            print(f"Uploading cover image to ImgBB...")
            success = audio.upload_cover_to_imgbb(cover_image_file)
            if success:
                print(f"✅ Cover image uploaded to ImgBB successfully!")
            else:
                print(f"❌ Cover image upload to ImgBB failed!")
        
        return audio

class AudioUpdateSerializer(serializers.ModelSerializer):
    cover_image_file = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = Audio
        fields = [
            'title', 'description', 'cover_image_file', 'artist', 'album', 'genre', 
            'year', 'is_public', 'is_featured', 'published', 'related_events'
        ]
    
    def update(self, instance, validated_data):
        # Extract cover image file
        cover_image_file = validated_data.pop('cover_image_file', None)
        
        # Update the instance
        audio = super().update(instance, validated_data)
        
        # Upload new cover image to ImgBB if provided
        if cover_image_file:
            audio.upload_cover_to_imgbb(cover_image_file)
        
        return audio

class AudioListSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    duration_formatted = serializers.ReadOnlyField()
    
    # Override audio_file to handle both FileField and URLField
    audio_file = serializers.SerializerMethodField()
    
    def get_audio_file(self, obj):
        # Return B2 URL if available, otherwise return the file field
        if obj.b2_download_url:
            return obj.b2_download_url
        return obj.audio_file.url if obj.audio_file else None
    
    class Meta:
        model = Audio
        fields = [
            'id', 'title', 'description', 'audio_file', 'cover_image', 'cover_image_name',
            'b2_download_url', 'duration_formatted', 'file_size_mb', 'format', 'artist', 
            'is_public', 'is_featured', 'published', 'uploaded_by', 'created_at'
        ]
