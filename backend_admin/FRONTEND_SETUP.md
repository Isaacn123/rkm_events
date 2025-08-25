# Frontend API Connection Setup

This guide will help you fix the API connection issues between the frontend and Django backend.

## Problem
The frontend was getting a 500 error when trying to upload audio files because it was making requests to the wrong URL.

## Solution

### 1. Create Environment File
Create a `.env.local` file in the `frontend_admin` directory:

```bash
cd frontend_admin
cp env.local.example .env.local
```

### 2. Configure API URL
Edit the `.env.local` file and ensure it contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Django Backend
In the `backend_admin` directory, start the Django server:

```bash
cd backend_admin
python manage.py runserver 0.0.0.0:8000
```

### 4. Start Frontend
In a new terminal, start the Next.js frontend:

```bash
cd frontend_admin
npm run dev
```

### 5. Test the Connection
- Frontend should be running on: http://localhost:3000
- Backend should be running on: http://localhost:8000
- Try uploading an audio file from the frontend

## What Was Fixed

### 1. API Configuration
- Created centralized API configuration in `frontend_admin/src/lib/api.ts`
- All API endpoints now use the correct base URL
- Proper authentication headers for different request types

### 2. Updated Components
- **Audio Create Page**: Now uses correct API endpoint for uploads
- **Audio List Page**: Uses correct endpoints for fetching, toggling, and deleting
- **Audio Edit Page**: Uses correct endpoint for updates

### 3. CORS Configuration
- Django backend already configured to allow requests from `localhost:3000`
- Proper headers for file uploads and JSON requests

## API Endpoints

The frontend now correctly calls these Django endpoints:

- **Upload Audio**: `POST http://localhost:8000/api/admin/audios/`
- **List Audios**: `GET http://localhost:8000/api/admin/audios/`
- **Update Audio**: `PATCH http://localhost:8000/api/admin/audios/{id}/`
- **Delete Audio**: `DELETE http://localhost:8000/api/admin/audios/{id}/`
- **Toggle Status**: `POST http://localhost:8000/api/admin/audios/{id}/toggle_{action}/`

## Troubleshooting

### If you still get errors:

1. **Check Django server is running**:
   ```bash
   curl http://localhost:8000/api/public/audios/
   ```

2. **Check frontend environment**:
   ```bash
   # In frontend_admin directory
   cat .env.local
   ```

3. **Check browser console** for any CORS errors

4. **Verify API endpoints** are accessible:
   ```bash
   curl http://localhost:8000/api/admin/audios/
   ```

### Common Issues:

- **500 Internal Server Error**: Django server not running or API endpoint not found
- **CORS Error**: Frontend trying to access wrong URL
- **Authentication Error**: JWT token not being sent correctly

## Next Steps

After fixing the connection:

1. **Configure ImgBB API** for cover image uploads
2. **Test audio upload** functionality
3. **Test cover image upload** to ImgBB album
4. **Verify all CRUD operations** work correctly
