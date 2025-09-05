from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import os
import requests
import json
from .config import IMGBB_API_KEY, IMGBB_URL, IMGBB_ALBUM_ID, B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME
from .backblaze_upload import upload_audio_to_b2, delete_audio_from_b2

def audio_file_path(instance, filename):
    """Generate file path for uploaded audio files"""
    # Get file extension
    ext = filename.split('.')[-1]
    # Create filename: title_slug.ext
    filename = f"{slugify(instance.title)}_{instance.id}.{ext}"
    return os.path.join('audios', filename)

class Audio(models.Model):
    AUDIO_FORMATS = [
        ('mp3', 'MP3'),
        ('wav', 'WAV'),
        ('m4a', 'M4A'),
        ('aac', 'AAC'),
        ('ogg', 'OGG'),
    ]
    
    title = models.CharField(max_length=200, help_text="Title of the audio file")
    description = models.TextField(blank=True, null=True, help_text="Description of the audio content")
    audio_file = models.FileField(
        upload_to=audio_file_path,
        max_length=500,
        help_text="Upload audio file (MP3, WAV, M4A, AAC, OGG)"
    )
    # Cover image fields
    cover_image = models.URLField(blank=True, null=True, help_text="Cover image URL from ImgBB")
    cover_image_name = models.CharField(max_length=200, blank=True, null=True, help_text="Cover image filename")
    
    # Backblaze B2 fields
    b2_file_name = models.CharField(max_length=500, blank=True, null=True, help_text="File name in Backblaze B2")
    b2_file_id = models.CharField(max_length=100, blank=True, null=True, help_text="File ID in Backblaze B2")
    b2_download_url = models.URLField(blank=True, null=True, help_text="Download URL from Backblaze B2")
    
    duration = models.DurationField(blank=True, null=True, help_text="Duration of the audio")
    file_size = models.PositiveIntegerField(blank=True, null=True, help_text="File size in bytes")
    format = models.CharField(max_length=10, choices=AUDIO_FORMATS, blank=True, null=True)
    
    # Metadata
    artist = models.CharField(max_length=200, blank=True, null=True)
    album = models.CharField(max_length=200, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    year = models.PositiveIntegerField(blank=True, null=True)
    
    # Status and visibility
    is_public = models.BooleanField(default=True, help_text="Whether this audio is publicly accessible")
    is_featured = models.BooleanField(default=False, help_text="Featured audio for homepage")
    published = models.BooleanField(default=False, help_text="Whether this audio is published and available in public API")
    
    # Relationships
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='uploaded_audios',
        help_text="User who uploaded this audio"
    )
    related_events = models.ManyToManyField(
        'events.Events',
        blank=True,
        related_name='audios',
        help_text="Events related to this audio"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Audio'
        verbose_name_plural = 'Audios'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Auto-generate format from file extension
        if self.audio_file and not self.format:
            filename = self.audio_file.name
            ext = filename.split('.')[-1].lower()
            if ext in dict(self.AUDIO_FORMATS):
                self.format = ext
        
        # Auto-calculate file size
        if self.audio_file and not self.file_size:
            try:
                self.file_size = self.audio_file.size
            except:
                pass
        
        super().save(*args, **kwargs)
    
    def upload_cover_to_imgbb(self, image_file):
        """Upload cover image to ImgBB album and return URL"""
        try:
            # Prepare the image data
            files = {'image': image_file}
            data = {
                'key': IMGBB_API_KEY,
                'name': f"audio_cover_{slugify(self.title)}",
                'album': IMGBB_ALBUM_ID  # Upload to specific album
            }
            
            # Upload to ImgBB
            response = requests.post(IMGBB_URL, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    # Save the URL and filename
                    self.cover_image = result['data']['url']
                    self.cover_image_name = result['data']['title']
                    self.save()
                    return True
            
            return False
        except Exception as e:
            print(f"Error uploading to ImgBB: {e}")
            return False
    
    def upload_audio_to_backblaze(self, audio_file):
        """Upload audio file to Backblaze B2 bucket"""
        try:
            # Upload to Backblaze B2
            result = upload_audio_to_b2(audio_file, self.title, self.id)
            
            if result['success']:
                # Save B2 information
                self.b2_file_name = result['file_name']
                self.b2_file_id = result['file_id']
                self.b2_download_url = result['download_url']
                
                # Update audio_file field to point to B2 URL
                self.audio_file = result['download_url']
                
                # Detect duration if not set
                if not self.duration:
                    self.detect_audio_duration(audio_file)
                
                self.save()
                return True
            else:
                print(f"Backblaze B2 upload failed: {result['error']}")
                return False
                
        except Exception as e:
            print(f"Error uploading to Backblaze B2: {e}")
            return False
    
    def detect_audio_duration(self, audio_file):
        """Detect audio duration using mutagen library"""
        try:
            import mutagen
            from mutagen.mp3 import MP3
            from mutagen.wave import WAVE
            from mutagen.m4a import M4A
            from mutagen.oggvorbis import OggVorbis
            from datetime import timedelta
            
            # Save file temporarily for duration detection
            # Extract just the filename without path
            filename = os.path.basename(audio_file.name)
            temp_path = f"/tmp/duration_check_{self.id}_{filename}"
            with open(temp_path, 'wb+') as destination:
                for chunk in audio_file.chunks():
                    destination.write(chunk)
            
            # Detect duration based on file format
            file_extension = audio_file.name.lower().split('.')[-1]
            
            if file_extension == 'mp3':
                audio = MP3(temp_path)
            elif file_extension == 'wav':
                audio = WAVE(temp_path)
            elif file_extension == 'm4a':
                audio = M4A(temp_path)
            elif file_extension == 'ogg':
                audio = OggVorbis(temp_path)
            else:
                # Try generic mutagen
                audio = mutagen.File(temp_path)
            
            if audio and hasattr(audio, 'info') and hasattr(audio.info, 'length'):
                duration_seconds = audio.info.length
                self.duration = timedelta(seconds=duration_seconds)
                print(f"✅ Duration detected: {self.duration_formatted}")
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
        except ImportError:
            print("⚠️ mutagen library not installed. Install with: pip install mutagen")
        except Exception as e:
            print(f"⚠️ Could not detect duration: {e}")
    
    def delete_from_backblaze(self):
        """Delete audio file from Backblaze B2 bucket"""
        try:
            if self.b2_file_name:
                success = delete_audio_from_b2(self.b2_file_name)
                if success:
                    # Clear B2 fields
                    self.b2_file_name = None
                    self.b2_file_id = None
                    self.b2_download_url = None
                    self.save()
                return success
            return False
        except Exception as e:
            print(f"Error deleting from Backblaze B2: {e}")
            return False
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0
    
    @property
    def duration_formatted(self):
        """Return formatted duration string"""
        if self.duration:
            total_seconds = int(self.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
        return "Unknown"
