#!/usr/bin/env python
"""
Test script for ImgBB image upload functionality
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

from audios.config import IMGBB_API_KEY, IMGBB_URL, IMGBB_ALBUM_ID
from django.core.files.uploadedfile import SimpleUploadedFile

def test_imgbb_config():
    """Test if ImgBB configuration is loaded correctly"""
    print("=== ImgBB Configuration Test ===\n")
    
    print(f"ImgBB API Key: {IMGBB_API_KEY}")
    print(f"ImgBB URL: {IMGBB_URL}")
    print(f"ImgBB Album ID: {IMGBB_ALBUM_ID}")
    
    if IMGBB_API_KEY == 'YOUR_IMGBB_API_KEY':
        print("❌ ImgBB API Key not loaded from environment!")
        return False
    else:
        print("✅ ImgBB API Key loaded successfully")
    
    if IMGBB_ALBUM_ID == 'YOUR_IMGBB_ALBUM_ID':
        print("❌ ImgBB Album ID not loaded from environment!")
        return False
    else:
        print("✅ ImgBB Album ID loaded successfully")
    
    return True

def test_imgbb_upload():
    """Test actual ImgBB upload with a dummy image"""
    print("\n=== ImgBB Upload Test ===\n")
    
    try:
        # Create a minimal valid JPEG image
        # This is a 1x1 pixel JPEG file
        minimal_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        dummy_file = SimpleUploadedFile(
            "test_image.jpg",
            minimal_jpeg,
            content_type="image/jpeg"
        )
        
        print(f"Created test image: {dummy_file.name}")
        
        # Prepare the upload data
        files = {'image': dummy_file}
        data = {
            'key': IMGBB_API_KEY,
            'name': 'test_audio_cover',
            'album': IMGBB_ALBUM_ID
        }
        
        print(f"Uploading to ImgBB...")
        print(f"API Key: {IMGBB_API_KEY[:10]}...")
        print(f"Album ID: {IMGBB_ALBUM_ID}")
        
        # Make the request
        response = requests.post(IMGBB_URL, files=files, data=data, timeout=30)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response JSON: {result}")
            
            if result.get('success'):
                print("✅ ImgBB upload successful!")
                print(f"Image URL: {result['data']['url']}")
                return True
            else:
                print(f"❌ ImgBB upload failed: {result.get('error', {}).get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response Text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during upload: {e}")
        return False

if __name__ == "__main__":
    print("=== ImgBB Upload Debug Test ===\n")
    
    # Test configuration
    config_ok = test_imgbb_config()
    
    if config_ok:
        # Test upload
        upload_ok = test_imgbb_upload()
        
        if upload_ok:
            print("\n✅ All tests passed! ImgBB upload should work.")
        else:
            print("\n❌ Upload test failed. Check the error above.")
    else:
        print("\n❌ Configuration test failed. Check your environment variables.")
    
    print("\n=== Test Complete ===")
