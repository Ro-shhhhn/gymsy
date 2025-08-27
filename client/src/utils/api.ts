// src/utils/api.ts
import type { UserPreferences, UserPreferencesResponse, SavePreferencesResponse, WorkoutPlan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiError extends Error {
  status: number;
  errors?: any[];

  constructor(message: string, status: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data: ApiResponse<T> = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.errors
    );
  }
  
  return data.data as T;
};

export const api = {
  // Auth endpoints
  auth: {
    register: async (userData: {
      name: string;
      email: string;
      password: string;
    }): Promise<{ message: string; email: string; expiresIn: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    verifyOtp: async (data: {
      email: string;
      otp: string;
    }): Promise<{
      message: string;
      user: {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
      };
      token: string;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    login: async (credentials: {
      email: string;
      password: string;
    }): Promise<{
      message: string;
      user: {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
      };
      token: string;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });
      return handleResponse(response);
    },

    resendOtp: async (email: string): Promise<{ message: string; expiresIn: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    checkEmail: async (email: string): Promise<{
      exists: boolean;
      isGoogleUser: boolean;
      isVerified: boolean;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },
  },

  // Dashboard endpoints
  dashboard: {
    getDashboardData: async (): Promise<{
      user: {
        id: string;
        name: string;
        email: string;
        fitnessLevel: string;
        fitnessGoals: string[];
      };
      stats: {
        workoutsThisWeek: number;
        totalHoursThisWeek: number;
        totalWorkouts: number;
        currentStreak: number;
      };
      lastWorkout: {
        name: string;
        type: string;
        completedAt: string;
        duration: number;
      } | null;
      motivationalQuote: string;
      recentWorkouts: Array<{
        id: string;
        name: string;
        type: string;
        completedAt: string;
        duration: number;
        caloriesBurned?: number;
      }>;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/dashboard`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (profileData: {
      name?: string;
      fitnessLevel?: string;
      fitnessGoals?: string[];
      age?: number;
      weight?: number;
      height?: number;
      targetWeight?: number;
      activityLevel?: string;
    }): Promise<{
      message: string;
      user: {
        id: string;
        name: string;
        email: string;
        fitnessLevel: string;
        fitnessGoals: string[];
        age?: number;
        weight?: number;
        height?: number;
        targetWeight?: number;
        activityLevel?: string;
      };
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },
  },

  // User Preferences endpoints
  preferences: {
    getPreferences: async (): Promise<UserPreferencesResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/preferences/get`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    savePreferences: async (preferences: UserPreferences): Promise<SavePreferencesResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/preferences/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      return handleResponse(response);
    },

    checkPreferences: async (): Promise<{ hasPreferences: boolean }> => {
      const response = await fetch(`${API_BASE_URL}/api/preferences/check`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Workout endpoints
  workouts: {
    // Get all premade workouts with filters
    getPremadeWorkouts: async (params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
      [key: string]: any;
    } = {}): Promise<{
      workouts: WorkoutPlan[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }> => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/workouts/premade?${queryParams}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Get single workout by ID
    getWorkoutById: async (workoutId: string): Promise<{
      workout: WorkoutPlan;
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/premade/${workoutId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Get filter options
    getFilterOptions: async (): Promise<{
      filterOptions: {
        goals: string[];
        fitnessLevels: string[];
        workoutTypes: string[];
        focusAreas: string[];
        planDurations: string[];
      };
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/filter-options`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    createWorkoutSession: async (workoutData: {
      workoutName: string;
      workoutType: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps?: number;
        weight?: number;
        duration?: number;
        restTime?: number;
      }>;
      duration: number;
      caloriesBurned?: number;
      notes?: string;
      difficulty: string;
    }): Promise<{
      message: string;
      workout: any;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workoutData),
      });
      return handleResponse(response);
    },

    getWorkoutHistory: async (page = 1, limit = 10): Promise<{
      workouts: any[];
      totalPages: number;
      currentPage: number;
      totalWorkouts: number;
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/sessions?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    deleteWorkoutSession: async (workoutId: string): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/sessions/${workoutId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Save/bookmark a workout
    saveWorkout: async (workoutId: string): Promise<{ message: string; isSaved: boolean }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/save/${workoutId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Remove saved workout
    removeSavedWorkout: async (workoutId: string): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/save/${workoutId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Get user's saved workouts
    getSavedWorkouts: async (): Promise<{ savedWorkouts: string[] }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/saved`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};

export { ApiError };

// Helper function to handle token expiration
export const handleAuthError = (error: ApiError): void => {
  if (error.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get current user from token (basic decode)
export const getCurrentUser = (): { userId: string; email: string } | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
};

// Helper function to check if user has preferences before accessing workout features
export const checkUserPreferences = async (): Promise<boolean> => {
  try {
    const result = await api.preferences.checkPreferences();
    return result.hasPreferences;
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return false;
  }
};