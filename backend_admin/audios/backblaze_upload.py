import os
import logging
from b2sdk.v2 import *
from django.conf import settings
from .config import B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME

logger = logging.getLogger(__name__)

class BackblazeB2Uploader:
    def __init__(self):
        self.info = InMemoryAccountInfo()
        self.b2_api = B2Api(self.info)
        self.bucket_name = B2_BUCKET_NAME
        
    def authenticate(self):
        """Authenticate with Backblaze B2"""
        try:
            self.b2_api.authorize_account("production", B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
            logger.info("Successfully authenticated with Backblaze B2")
            return True
        except Exception as e:
            logger.error(f"Backblaze B2 authentication failed: {e}")
            return False
    
    def upload_audio_file(self, file_path, file_name, content_type="audio/mpeg"):
        """
        Upload audio file to Backblaze B2 bucket
        
        Args:
            file_path: Local path to the audio file
            file_name: Name to save the file as in B2
            content_type: MIME type of the file
            
        Returns:
            dict: Upload result with URL and file info
        """
        try:
            # Authenticate
            if not self.authenticate():
                return {"success": False, "error": "Authentication failed"}
            
            # Get bucket
            bucket = self.b2_api.get_bucket_by_name(self.bucket_name)
            
            # Upload file
            uploaded_file = bucket.upload_local_file(
                local_file=file_path,
                file_name=file_name,
                content_type=content_type
            )
            
            # Get download URL
            download_url = self.b2_api.get_download_url_for_file_name(
                bucket_name=self.bucket_name,
                file_name=file_name
            )
            
            logger.info(f"Successfully uploaded {file_name} to Backblaze B2")
            
            return {
                "success": True,
                "file_id": uploaded_file.id_,
                "file_name": uploaded_file.file_name,
                "content_length": uploaded_file.size,
                "content_type": uploaded_file.content_type,
                "download_url": download_url,
                "upload_timestamp": uploaded_file.upload_timestamp
            }
            
        except Exception as e:
            logger.error(f"Backblaze B2 upload failed: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_audio_file(self, file_name):
        """
        Delete audio file from Backblaze B2 bucket
        
        Args:
            file_name: Name of the file to delete
            
        Returns:
            bool: Success status
        """
        try:
            if not self.authenticate():
                return False
            
            bucket = self.b2_api.get_bucket_by_name(self.bucket_name)
            
            # Get file info
            file_info = self.b2_api.get_file_info_by_name(bucket.id_, file_name)
            
            # Delete file
            self.b2_api.delete_file_version(file_info.id_, file_info.file_name)
            
            logger.info(f"Successfully deleted {file_name} from Backblaze B2")
            return True
            
        except Exception as e:
            logger.error(f"Backblaze B2 delete failed: {e}")
            return False
    
    def get_audio_url(self, file_name):
        """
        Get download URL for an audio file
        
        Args:
            file_name: Name of the file
            
        Returns:
            str: Download URL or None if not found
        """
        try:
            if not self.authenticate():
                return None
            
            download_url = self.b2_api.get_download_url_for_file_name(
                bucket_name=self.bucket_name,
                file_name=file_name
            )
            
            return download_url
            
        except Exception as e:
            logger.error(f"Failed to get download URL: {e}")
            return None

# Helper functions for easy integration
def upload_audio_to_b2(audio_file, title, audio_id):
    """
    Upload audio file to Backblaze B2 with proper naming
    
    Args:
        audio_file: Django UploadedFile object
        title: Audio title for naming
        audio_id: Audio ID for unique naming
        
    Returns:
        dict: Upload result
    """
    uploader = BackblazeB2Uploader()
    
    # Create file name: title-slug_audio-id.ext
    file_extension = os.path.splitext(audio_file.name)[1]
    file_name = f"{title.replace(' ', '-').lower()}_{audio_id}{file_extension}"
    
    # Determine content type
    content_type_map = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.ogg': 'audio/ogg'
    }
    content_type = content_type_map.get(file_extension.lower(), 'audio/mpeg')
    
    # Save file temporarily
    temp_path = f"/tmp/{file_name}"
    with open(temp_path, 'wb+') as destination:
        for chunk in audio_file.chunks():
            destination.write(chunk)
    
    try:
        # Upload to B2
        result = uploader.upload_audio_file(temp_path, file_name, content_type)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return result
        
    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e

def delete_audio_from_b2(file_name):
    """
    Delete audio file from Backblaze B2
    
    Args:
        file_name: Name of the file to delete
        
    Returns:
        bool: Success status
    """
    uploader = BackblazeB2Uploader()
    return uploader.delete_audio_file(file_name)
