// API utility for making HTTP requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch function with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    // Try to parse JSON, but handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If response isn't JSON, return text or empty object
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    return data;
  } catch (error) {
    // Handle timeout/abort errors
    if (error.name === 'AbortError') {
      console.error('Request timeout - server took too long to respond');
      throw new Error('Request timed out. The server may be experiencing issues or the database connection failed.');
    }
    // Handle network errors specifically
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network Error - Is the backend server running?', error);
      throw new Error('Failed to connect to server. Make sure the backend is running on port 3001.');
    }
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Automatically store token if provided
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Projects API
export const projectsAPI = {
  getProjects: () => 
    apiRequest('/projects', {
      method: 'GET',
    }),

  getProjectDetails: (projectId) => 
    apiRequest('/projects/details', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),
};

// Shifts API
export const shiftsAPI = {
  getUpcomingShifts: () => 
    apiRequest('/shifts/upcoming', {
      method: 'GET',
    }),

  getTodayShifts: () => 
    apiRequest('/shifts/today', {
      method: 'GET',
    }),
};

// Manager API
export const managerAPI = {
  getUpcomingProjects: () => 
    apiRequest('/manager/projects', {
      method: 'GET',
    }),

  selectProject: (projectId) => 
    apiRequest('/manager/select-project', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),

  createProjectGroup: (groupData) => 
    apiRequest('/manager/create-group', {
      method: 'POST',
      body: JSON.stringify(groupData),
    }),
};

// User API
export const userAPI = {
  getProfile: () => 
    apiRequest('/user/profile', {
      method: 'GET',
    }),

  getPay: () => 
    apiRequest('/user/pay', {
      method: 'GET',
    }),
};

// Health check
export const healthCheck = () => 
  apiRequest('/health', {
    method: 'GET',
  });

export default apiRequest;

