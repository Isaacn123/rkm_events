// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/token/`,
  REGISTER: `${API_BASE_URL}/api/register/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/token/refresh/`,
  
  // Audio endpoints
  AUDIOS: {
    ADMIN: `${API_BASE_URL}/api/admin/audios/`,
    PUBLIC: `${API_BASE_URL}/api/public/audios/`,
    UPLOAD: `${API_BASE_URL}/api/admin/audios/`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/admin/audios/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/api/admin/audios/${id}/`,
    TOGGLE_FEATURED: (id: string) => `${API_BASE_URL}/api/admin/audios/${id}/toggle_featured/`,
    TOGGLE_PUBLIC: (id: string) => `${API_BASE_URL}/api/admin/audios/${id}/toggle_public/`,
    TOGGLE_PUBLISHED: (id: string) => `${API_BASE_URL}/api/admin/audios/${id}/toggle_published/`,
    STATISTICS: `${API_BASE_URL}/api/admin/audios/statistics/`,
  },
  
  // Events endpoints
  EVENTS: {
    LIST: `${API_BASE_URL}/api/events/`,
    CREATE: `${API_BASE_URL}/api/events/`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/events/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/api/events/${id}/`,
  },
  
  // User endpoints
  USERS: {
    LIST: `${API_BASE_URL}/api/users/`,
    PROFILE: `${API_BASE_URL}/api/users/profile/`,
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper function to get auth headers for file uploads
export const getAuthHeadersForUpload = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  // Don't set Content-Type for FormData uploads
});
