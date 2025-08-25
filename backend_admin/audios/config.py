# Audio Upload Configuration
# Load environment variables from .env file
import os
from dotenv import dotenv_values

# Load environment variables from .env file
config = dotenv_values()

# ImgBB Configuration for cover images
IMGBB_API_KEY = config.get('IMGBB_API_KEY', 'YOUR_IMGBB_API_KEY')
IMGBB_URL = 'https://api.imgbb.com/1/upload'
IMGBB_ALBUM_ID = config.get('IMGBB_ALBUM_ID', 'YOUR_IMGBB_ALBUM_ID')

# Backblaze B2 Configuration for audio files
B2_APPLICATION_KEY_ID = config.get('B2_APPLICATION_KEY_ID', 'YOUR_B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = config.get('B2_APPLICATION_KEY', 'YOUR_B2_APPLICATION_KEY')
B2_BUCKET_NAME = config.get('B2_BUCKET_NAME', 'mcc-service-audios')

# Audio file settings
MAX_AUDIO_SIZE = int(config.get('MAX_AUDIO_SIZE', 100 * 1024 * 1024))  # 100MB default
MAX_COVER_SIZE = int(config.get('MAX_COVER_SIZE', 5 * 1024 * 1024))    # 5MB default

# Supported audio formats
SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'aac', 'ogg']

# Supported image formats
SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
