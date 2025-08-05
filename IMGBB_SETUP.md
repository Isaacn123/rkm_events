# ImgBB API Setup Guide

## Getting Your ImgBB API Key

1. **Go to ImgBB**: Visit [imgbb.com](https://imgbb.com/)
2. **Sign Up**: Create a free account
3. **Get API Key**: 
   - Go to your account settings
   - Look for "API" or "Developer" section
   - Copy your API key

## Update Your Code

1. **Replace the API Key** in `frontend/src/app/create-article/page.tsx`:
   ```typescript
   const IMGBB_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'; // Replace this
   ```

## How It Works

1. **Upload Image**: When you select an image in the create article form, it automatically uploads to ImgBB
2. **Get URL**: ImgBB returns a direct image URL
3. **Store in Database**: The URL is saved with your article
4. **Display**: Images appear in the articles list and article details

## Features

- ✅ **Automatic Upload**: Images upload when you select them
- ✅ **File Validation**: Only images under 32MB accepted
- ✅ **Success Indicator**: Shows when image uploads successfully
- ✅ **Display in Articles**: Images show in the articles list
- ✅ **Free Service**: ImgBB is free for basic usage

## Troubleshooting

- **API Key Error**: Make sure you've replaced `YOUR_IMGBB_API_KEY` with your actual key
- **Upload Fails**: Check your internet connection and file size
- **Image Not Showing**: Verify the image URL is valid

## Next Steps

1. Get your ImgBB API key
2. Update the code with your key
3. Test by creating an article with an image
4. Check that images display in the articles list 