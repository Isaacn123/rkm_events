"""
Example usage of Backblaze B2 audio upload functionality
"""

from .backblaze_upload import BackblazeB2Uploader, upload_audio_to_b2, delete_audio_from_b2

# Example 1: Using the uploader class directly
def example_direct_upload():
    """Example of direct upload using the BackblazeB2Uploader class"""
    
    uploader = BackblazeB2Uploader()
    
    # Upload a file
    result = uploader.upload_audio_file(
        file_path="/path/to/your/audio.mp3",
        file_name="my-audio-file.mp3",
        content_type="audio/mpeg"
    )
    
    if result['success']:
        print(f"Upload successful!")
        print(f"File ID: {result['file_id']}")
        print(f"Download URL: {result['download_url']}")
        print(f"File size: {result['content_length']} bytes")
    else:
        print(f"Upload failed: {result['error']}")

# Example 2: Using the helper function
def example_helper_upload():
    """Example using the helper function with Django UploadedFile"""
    
    # This would be in your Django view
    from django.core.files.uploadedfile import UploadedFile
    
    # Simulate an uploaded file
    audio_file = UploadedFile(
        file=open("/path/to/your/audio.mp3", "rb"),
        name="audio.mp3"
    )
    
    title = "My Awesome Audio"
    audio_id = 123
    
    result = upload_audio_to_b2(audio_file, title, audio_id)
    
    if result['success']:
        print(f"Upload successful!")
        print(f"File name: {result['file_name']}")
        print(f"Download URL: {result['download_url']}")
    else:
        print(f"Upload failed: {result['error']}")

# Example 3: Delete a file
def example_delete():
    """Example of deleting a file from Backblaze B2"""
    
    file_name = "my-audio-file.mp3"
    
    success = delete_audio_from_b2(file_name)
    
    if success:
        print(f"File {file_name} deleted successfully")
    else:
        print(f"Failed to delete {file_name}")

# Example 4: Get download URL
def example_get_url():
    """Example of getting a download URL"""
    
    uploader = BackblazeB2Uploader()
    
    file_name = "my-audio-file.mp3"
    download_url = uploader.get_audio_url(file_name)
    
    if download_url:
        print(f"Download URL: {download_url}")
    else:
        print("Failed to get download URL")

# Example 5: Complete workflow in Django view
def example_django_view():
    """
    Example of how this would work in a Django view
    """
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    from django.core.files.uploadedfile import UploadedFile
    
    @csrf_exempt
    def upload_audio_view(request):
        if request.method == 'POST':
            try:
                # Get the uploaded file
                audio_file = request.FILES.get('audio_file')
                title = request.POST.get('title', 'Untitled')
                
                if not audio_file:
                    return JsonResponse({'error': 'No audio file provided'}, status=400)
                
                # Create audio record first
                audio = Audio.objects.create(
                    title=title,
                    uploaded_by=request.user
                )
                
                # Upload to Backblaze B2
                result = upload_audio_to_b2(audio_file, title, audio.id)
                
                if result['success']:
                    # Update audio record with B2 info
                    audio.b2_file_name = result['file_name']
                    audio.b2_file_id = result['file_id']
                    audio.b2_download_url = result['download_url']
                    audio.save()
                    
                    return JsonResponse({
                        'success': True,
                        'audio_id': audio.id,
                        'download_url': result['download_url']
                    })
                else:
                    # Delete the audio record if upload failed
                    audio.delete()
                    return JsonResponse({
                        'error': f'Upload failed: {result["error"]}'
                    }, status=500)
                    
            except Exception as e:
                return JsonResponse({
                    'error': f'Server error: {str(e)}'
                }, status=500)
        
        return JsonResponse({'error': 'Method not allowed'}, status=405)

if __name__ == "__main__":
    # Run examples
    print("=== Backblaze B2 Audio Upload Examples ===\n")
    
    print("1. Direct upload example:")
    example_direct_upload()
    print()
    
    print("2. Helper function example:")
    example_helper_upload()
    print()
    
    print("3. Delete file example:")
    example_delete()
    print()
    
    print("4. Get download URL example:")
    example_get_url()
    print()
