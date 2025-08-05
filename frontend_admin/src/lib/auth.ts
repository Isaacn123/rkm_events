export const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      return null;
    }

    const response = await fetch('http://127.0.0.1:8000/api/user/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refresh_token,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return data.access_token;
    } else {
      // Refresh token is invalid, clear all tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  let token = localStorage.getItem('token');
  
  // Check if token exists and is not expired
  if (token && !isTokenExpired(token)) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  // Token is missing or expired, try to refresh
  if (token) {
    console.log('Token expired, attempting refresh...');
    token = await refreshToken();
  }
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  // If no token available, redirect to login
  if (typeof window !== 'undefined') {
    console.log('No valid token found, redirecting to login...');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't decode, assume it's expired
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}; 