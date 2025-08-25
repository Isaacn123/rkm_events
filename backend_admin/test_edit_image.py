#!/usr/bin/env python
"""
Test script for audio cover image update functionality
"""
import os
import sys
import django
import requests

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_admin.settings')

# Set local development environment variables if not present
if 'MYSQL_DATABASE' not in os.environ:
    os.environ['MYSQL_DATABASE'] = 'rkm_events_dashboard_new'
if 'MYSQL_USER' not in os.environ:
    os.environ['MYSQL_USER'] = 'root'
if 'MYSQL_PASSWORD' not in os.environ:
    os.environ['MYSQL_PASSWORD'] = ''
if 'MYSQL_HOST' not in os.environ:
    os.environ['MYSQL_HOST'] = 'localhost'
if 'MYSQL_PORT' not in os.environ:
    os.environ['MYSQL_PORT'] = '3306'

django.setup()

from audios.models import Audio
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

def test_audio_cover_update():
    """Test updating an audio cover image"""
    print("=== Audio Cover Image Update Test ===\n")
    
    # Get the first user
    user = User.objects.first()
    if not user:
        print("❌ No user found in database")
        return False
    
    # Get the first audio file
    audio = Audio.objects.first()
    if not audio:
        print("❌ No audio found in database")
        return False
    
    print(f"Testing with audio: {audio.title} (ID: {audio.id})")
    print(f"Current cover image: {audio.cover_image}")
    
    # Create a test image file
    minimal_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
    
    test_image = SimpleUploadedFile(
        "test_cover_update.jpg",
        minimal_jpeg,
        content_type="image/jpeg"
    )
    
    print(f"Created test image: {test_image.name}")
    
    try:
        # Test the upload_cover_to_imgbb method
        print("Testing cover image upload...")
        success = audio.upload_cover_to_imgbb(test_image)
        
        if success:
            print("✅ Cover image upload successful!")
            print(f"New cover image URL: {audio.cover_image}")
            print(f"Cover image name: {audio.cover_image_name}")
            
            # Refresh from database
            audio.refresh_from_db()
            print(f"Updated cover image URL: {audio.cover_image}")
            
            return True
        else:
            print("❌ Cover image upload failed!")
            return False
            
    except Exception as e:
        print(f"❌ Exception during cover image upload: {e}")
        return False

def test_audio_update_serializer():
    """Test the AudioUpdateSerializer"""
    print("\n=== AudioUpdateSerializer Test ===\n")
    
    from audios.serializers import AudioUpdateSerializer
    from django.test import RequestFactory
    from django.contrib.auth.models import User
    
    # Get the first user and audio
    user = User.objects.first()
    audio = Audio.objects.first()
    
    if not user or not audio:
        print("❌ No user or audio found")
        return False
    
    # Create a test request
    factory = RequestFactory()
    request = factory.patch('/api/admin/audios/1/')
    request.user = user
    
    # Create test image
    minimal_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
    
    test_image = SimpleUploadedFile(
        "test_serializer_update.jpg",
        minimal_jpeg,
        content_type="image/jpeg"
    )
    
    # Test data
    data = {
        'title': f"{audio.title} (Updated)",
        'cover_image_file': test_image
    }
    
    try:
        # Create serializer
        serializer = AudioUpdateSerializer(
            instance=audio,
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            print("✅ Serializer is valid")
            updated_audio = serializer.save()
            print(f"✅ Audio updated successfully!")
            print(f"New title: {updated_audio.title}")
            print(f"New cover image: {updated_audio.cover_image}")
            return True
        else:
            print("❌ Serializer validation failed:")
            print(serializer.errors)
            return False
            
    except Exception as e:
        print(f"❌ Exception during serializer test: {e}")
        return False

if __name__ == "__main__":
    print("=== Audio Cover Image Update Test Suite ===\n")
    
    # Test 1: Direct model method
    test1_result = test_audio_cover_update()
    
    # Test 2: Serializer method
    test2_result = test_audio_update_serializer()
    
    print(f"\n=== Test Results ===")
    print(f"Model Method Test: {'✅ PASSED' if test1_result else '❌ FAILED'}")
    print(f"Serializer Test: {'✅ PASSED' if test2_result else '❌ FAILED'}")
    
    if test1_result and test2_result:
        print("\n🎉 All tests passed! Audio cover image update is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
    
    print("\n=== Test Complete ===")
