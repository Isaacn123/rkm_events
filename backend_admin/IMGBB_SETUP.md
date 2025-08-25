# ImgBB Album Setup for Audio Covers

This guide explains how to set up ImgBB to upload audio cover images to a specific album called "audio_covers".

## Step 1: Create ImgBB Account
1. Go to [ImgBB](https://imgbb.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get API Key
1. Go to [ImgBB API](https://imgbb.com/api)
2. Click "Get API Key"
3. Copy your API key

## Step 3: Create Album
1. Log into your ImgBB account
2. Go to "Albums" section
3. Create a new album named "audio_covers"
4. Note down the Album ID (you'll need this)

## Step 4: Get Album ID
1. Go to your "audio_covers" album
2. Look at the URL: `https://imgbb.com/album/ALBUM_ID`
3. Copy the ALBUM_ID from the URL

## Step 5: Configure Your App
Update your `backend_admin/audios/config.py` file:

```python
# ImgBB Configuration for cover images
IMGBB_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'
IMGBB_URL = 'https://api.imgbb.com/1/upload'
IMGBB_ALBUM_ID = 'YOUR_ALBUM_ID_HERE'  # Album ID for "audio_covers" album
```

## Step 6: Test Upload
After configuration, when you upload an audio cover image:
- It will be uploaded to your ImgBB account
- It will be placed in the "audio_covers" album
- The image name will be: `audio_cover_[title-slug]`
- The URL will be saved in your database

## Example Album ID
If your album URL is: `https://imgbb.com/album/a1b2c3d4`
Then your Album ID is: `a1b2c3d4`

## Benefits
- All audio covers organized in one album
- Easy to manage and view all covers
- Consistent naming convention
- No need to manage local file storage

## Troubleshooting
- **API Key Error**: Make sure your API key is correct and active
- **Album ID Error**: Verify the album ID exists and you have access to it
- **Upload Failed**: Check your internet connection and ImgBB service status
