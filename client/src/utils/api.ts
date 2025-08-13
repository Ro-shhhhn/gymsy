// src/utils/api.ts - Enhanced API utilities with progress tracking
import type { 
  UserPreferences, 
  UserPreferencesResponse, 
  SavePreferencesResponse,
  WorkoutPlan,
  UserProgress
} from '../types';

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

interface WorkoutWithProgress extends WorkoutPlan {
  userProgress?: UserProgress | null;
}

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

  // Enhanced Workout endpoints with progress tracking
  workouts: {
    // Get all workouts with user progress
    getWorkouts: async (params?: {
      page?: number;
      limit?: number;
      goal?: string;
      fitnessLevel?: string;
      workoutType?: string;
      focusAreas?: string[];
      planDuration?: string;
      minDuration?: number;
      maxDuration?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
      featured?: boolean;
    }): Promise<{
      workouts: WorkoutWithProgress[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: any;
    }> => {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              searchParams.append(key, value.join(','));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/api/workouts/premade?${searchParams.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Get single workout details with user progress
    getWorkoutDetails: async (workoutId: string): Promise<{
      workout: WorkoutWithProgress;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Get related workouts
    getRelatedWorkouts: async (workoutId: string, limit = 6): Promise<{
      relatedWorkouts: WorkoutWithProgress[];
      count: number;
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/premade/${workoutId}/related?limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Bookmark workout
    bookmarkWorkout: async (workoutId: string): Promise<{
      workoutId: string;
      isBookmarked: boolean;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/bookmark`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Remove bookmark
    removeBookmark: async (workoutId: string): Promise<{
      workoutId: string;
      isBookmarked: boolean;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/bookmark`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Start workout session
    startWorkoutSession: async (workoutId: string): Promise<{
      sessionId: string;
      workoutId: string;
      startedAt: string;
      currentWeek: number;
      currentDay: number;
      workout: {
        title: string;
        exercises: Array<{
          name: string;
          sets: number;
          reps?: number;
          duration?: number;
          restTime: number;
          instructions?: string;
          targetMuscles: string[];
          equipment?: string[];
        }>;
        duration: number;
        caloriesBurnEstimate: number;
      };
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Complete workout day
    completeWorkoutDay: async (workoutId: string, data: {
      week: number;
      day: number;
      duration: number;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      caloriesBurned?: number;
      notes?: string;
      sessionId?: string;
    }): Promise<{
      workoutId: string;
      week: number;
      day: number;
      completionPercentage: number;
      currentStreak: number;
      totalCompletedDays: number;
      isWorkoutCompleted: boolean;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/complete-day`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    // Rate workout
    rateWorkout: async (workoutId: string, rating: number, review?: string): Promise<{
      workoutId: string;
      rating: number;
      review?: string;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, review }),
      });
      return handleResponse(response);
    },

    // Get user's bookmarked workouts
    getUserBookmarks: async (page = 1, limit = 10): Promise<{
      bookmarkedWorkouts: WorkoutWithProgress[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/bookmarks?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Get user's progress overview
    getProgressOverview: async (): Promise<{
      stats: {
        totalWorkouts: number;
        startedWorkouts: number;
        completedWorkouts: number;
        bookmarkedWorkouts: number;
        totalTimeSpent: number;
        totalCaloriesBurned: number;
        totalCompletedDays: number;
        averageRating: number;
        longestStreak: number;
      };
      recentActivity: Array<{
        workout: {
          _id: string;
          title: string;
          imageUrl?: string;
          thumbnailUrl?: string;
        };
        completionPercentage: number;
        currentWeek: number;
        currentDay: number;
        lastAccessedAt: string;
        isCompleted: boolean;
      }>;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/progress/overview`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Get user's progress for specific workout
    getWorkoutProgress: async (workoutId: string): Promise<{
      hasProgress: boolean;
      progress?: UserProgress;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/premade/${workoutId}/progress`, {
        headers: getAuthHeaders(),
      });
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
        categories: string[];
      };
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/workouts/filter-options`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Search workouts
    searchWorkouts: async (query: string, limit = 5): Promise<{
      suggestions: Array<{
        id: string;
        title: string;
        goal: string;
        fitnessLevel: string;
        focusAreas: string[];
      }>;
    }> => {
      const response = await fetch(
        `${API_BASE_URL}/api/workouts/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handleResponse(response);
    },

    // Legacy workout session endpoints (for compatibility)
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

// Helper function to check if user has preferences
export const checkUserPreferences = async (): Promise<boolean> => {
  try {
    const result = await api.preferences.checkPreferences();
    return result.hasPreferences;
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return false;
  }
};

// Progress tracking helper functions
export const getProgressStatusText = (progress: UserProgress | null): string => {
  if (!progress || !progress.isStarted) {
    return 'Not Started';
  }
  
  if (progress.isCompleted) {
    return 'Completed';
  }
  
  return `Week ${progress.currentWeek}, Day ${progress.currentDay}`;
};

export const getProgressColor = (progress: UserProgress | null): string => {
  if (!progress || !progress.isStarted) {
    return 'text-gray-500';
  }
  
  if (progress.isCompleted) {
    return 'text-green-600';
  }
  
  if (progress.completionPercentage >= 75) {
    return 'text-blue-600';
  }
  
  if (progress.completionPercentage >= 50) {
    return 'text-yellow-600';
  }
  
  return 'text-orange-600';
};

export const getDayStatus = (
  progress: UserProgress | null,
  week: number,
  day: number
): {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
} => {
  if (!progress) {
    return {
      isCompleted: false,
      isUnlocked: week === 1 && day === 1,
      isActive: false
    };
  }

  // Check if day is completed
  const isCompleted = progress.completedDays.some(
    completedDay => completedDay.week === week && completedDay.day === day
  );

  // Check if day is current active day
  const isActive = progress.currentWeek === week && progress.currentDay === day && !isCompleted;

  // Check if day is unlocked
  let isUnlocked = false;
  
  if (week === 1 && day === 1) {
    // First day is always unlocked
    isUnlocked = true;
  } else if (isCompleted || isActive) {
    // Completed days and active day are unlocked
    isUnlocked = true;
  } else if (week < progress.currentWeek) {
    // Previous weeks are unlocked
    isUnlocked = true;
  } else if (week === progress.currentWeek && day < progress.currentDay) {
    // Previous days in current week are unlocked
    isUnlocked = true;
  }

  return {
    isCompleted,
    isUnlocked,
    isActive
  };
};

export const getWeekStatus = (
  progress: UserProgress | null,
  week: number,
  totalDaysPerWeek: number
): {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  completedDays: number;
} => {
  if (!progress) {
    return {
      isCompleted: false,
      isUnlocked: week === 1,
      isActive: false,
      completedDays: 0
    };
  }

  const weekCompletedDays = progress.completedDays.filter(day => day.week === week);
  const isCompleted = weekCompletedDays.length === totalDaysPerWeek;
  const isActive = progress.currentWeek === week;
  const isUnlocked = week <= progress.currentWeek + 1;

  return {
    isCompleted,
    isUnlocked,
    isActive,
    completedDays: weekCompletedDays.length
  };
};

// Helper function to format workout duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Helper function to format calories
export const formatCalories = (calories: number): string => {
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k cal`;
  }
  return `${calories} cal`;
};

// Helper function to get difficulty label and color
export const getDifficultyInfo = (difficulty: number): {
  label: string;
  color: string;
} => {
  switch (difficulty) {
    case 1:
      return { label: 'Very Easy', color: 'text-green-600 bg-green-100' };
    case 2:
      return { label: 'Easy', color: 'text-green-600 bg-green-100' };
    case 3:
      return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-100' };
    case 4:
      return { label: 'Hard', color: 'text-orange-600 bg-orange-100' };
    case 5:
      return { label: 'Very Hard', color: 'text-red-600 bg-red-100' };
    default:
      return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-100' };
  }
};

// Helper function to format dates
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

// Helper function to calculate streak emoji
export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return '💤';
  if (streak < 3) return '🔥';
  if (streak < 7) return '🚀';
  if (streak < 14) return '⭐';
  if (streak < 30) return '🏆';
  return '👑';
};

// Helper function to get motivational message based on progress
export const getMotivationalMessage = (progress: UserProgress | null): string => {
  if (!progress || !progress.isStarted) {
    return "Ready to start your fitness journey? Let's go! 💪";
  }
  
  if (progress.isCompleted) {
    return "Congratulations! You've completed this workout plan! 🎉";
  }
  
  const percentage = progress.completionPercentage;
  
  if (percentage < 25) {
    return "Great start! Keep up the momentum! 🚀";
  } else if (percentage < 50) {
    return "You're making excellent progress! Stay strong! 💪";
  } else if (percentage < 75) {
    return "More than halfway there! You've got this! 🔥";
  } else {
    return "Almost there! Finish strong! 🏆";
  }
};

// Helper function to validate workout day completion data
export const validateWorkoutDayData = (data: {
  week: number;
  day: number;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  caloriesBurned?: number;
  notes?: string;
}): string[] => {
  const errors: string[] = [];
  
  if (data.week < 1) {
    errors.push('Week must be a positive number');
  }
  
  if (data.day < 1 || data.day > 7) {
    errors.push('Day must be between 1 and 7');
  }
  
  if (data.duration < 1) {
    errors.push('Duration must be at least 1 minute');
  }
  
  if (!['Easy', 'Medium', 'Hard'].includes(data.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard');
  }
  
  if (data.caloriesBurned !== undefined && data.caloriesBurned < 0) {
    errors.push('Calories burned cannot be negative');
  }
  
  if (data.notes && data.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }
  
  return errors;
};

// Helper function for local storage with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }
};