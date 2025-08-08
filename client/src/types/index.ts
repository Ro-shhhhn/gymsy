// src/types/index.ts
import type { LucideIcon } from 'lucide-react';

// User Preferences interfaces
export interface UserPreferences {
  height: number;
  weight: number;
  age?: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  fitnessGoals: string[];
  timeAvailability: {
    minutesPerDay: number;
    daysPerWeek: number;
  };
  planDuration: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  workoutEnvironment: 'Home' | 'Gym' | 'No equipment' | 'With dumbbells/bands only';
}

export interface UserPreferencesResponse {
  hasPreferences: boolean;
  preferences?: UserPreferences;
}

export interface SavePreferencesRequest extends UserPreferences {}

export interface SavePreferencesResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    hasPreferences: boolean;
  };
}

// User related types (Updated with preferences)
export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoals?: string[];
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  targetWeight?: number; // in kg
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  hasPreferences?: boolean; // New field to track if user has set preferences
  timeAvailability?: {
    minutesPerDay: number;
    daysPerWeek: number;
  };
  planDuration?: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  workoutEnvironment?: 'Home' | 'Gym' | 'No equipment' | 'With dumbbells/bands only';
  createdAt: string;
  updatedAt: string;
}

// Workout related types (Enhanced with detailed Exercise interface)
export interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in seconds for time-based exercises
  restTime: number; // in seconds (made required for consistency)
  instructions?: string;
  targetMuscles: string[];
  equipment?: string[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutName: string;
  workoutType: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Full Body' | 'Core' | 'Custom';
  exercises: Exercise[];
  duration: number; // total workout duration in minutes
  caloriesBurned?: number;
  completedAt: string;
  notes?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isCompleted: boolean;
}

// Enhanced WorkoutPlan interface (merged from both files)
export interface WorkoutPlan {
  _id: string;
  id?: string; // for compatibility
  name?: string; // legacy support
  title: string;
  description: string;
  goal: 'Fat Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'Flexibility' | 'General Fitness';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // Total workout time in minutes
  focusAreas: string[]; // e.g., ['Arms', 'Core', 'Legs']
  workoutType: 'Home' | 'Gym' | 'No Equipment' | 'Dumbbells/Bands Only';
  caloriesBurnEstimate: number;
  planDuration: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  
  exercises: Exercise[];
  workoutsPerWeek: number;
  schedule?: Array<{
    day: number;
    exercises: number[];
  }>;
  
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  rating: number;
  totalRatings: number;
  averageRating?: number; // calculated field
  totalExercises?: number; // calculated field
  
  // Legacy fields for backward compatibility
  targetGoals?: string[];
  
  createdBy: 'Admin' | 'AI' | 'Professional' | 'Community'; // Extended with Community
  isPublished: boolean;
  isFeatured: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// Workout filtering and querying types
export interface WorkoutFilters {
  goal?: string;
  fitnessLevel?: string;
  workoutType?: string;
  focusAreas?: string[];
  planDuration?: string;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  featured?: boolean;
}

export interface WorkoutSortOptions {
  sortBy: 'createdAt' | 'rating' | 'duration' | 'title' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

export interface WorkoutQueryParams extends WorkoutFilters, WorkoutSortOptions {
  page?: number;
  limit?: number;
}

export interface WorkoutResponse {
  workouts: WorkoutPlan[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: WorkoutFilters;
}

export interface WorkoutFilterOptions {
  goals: string[];
  fitnessLevels: string[];
  workoutTypes: string[];
  focusAreas: string[];
  planDurations: string[];
}

export interface WorkoutSearchSuggestion {
  id: string;
  title: string;
  goal: string;
  fitnessLevel: string;
  focusAreas: string[];
}

// Dashboard related types
export interface DashboardStats {
  workoutsThisWeek: number;
  totalHoursThisWeek: number;
  totalWorkouts: number;
  currentStreak: number;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    fitnessLevel: string;
    fitnessGoals: string[];
  };
  stats: DashboardStats;
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
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// Auth related types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
  };
  token?: string;
  requiresVerification?: boolean;
  email?: string;
  expiresIn?: number;
  expired?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPData {
  email: string;
  otp: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Component prop types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

// UI Component prop types
export interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

// Component props for workout components
export interface WorkoutCardProps {
  workout: WorkoutPlan;
  onViewPlan: (workoutId: string) => void;
  onSavePlan?: (workoutId: string) => void;
  isSaved?: boolean;
  className?: string;
}

export interface WorkoutFiltersProps {
  filters: WorkoutFilters;
  filterOptions: WorkoutFilterOptions;
  onFilterChange: (filters: WorkoutFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface WorkoutSortingProps {
  sortOptions: WorkoutSortOptions;
  onSortChange: (sortOptions: WorkoutSortOptions) => void;
  className?: string;
}

export interface PremadeWorkoutsPageProps {
  className?: string;
}

// Mouse interaction types
export interface MousePosition {
  x: number;
  y: number;
}

// Progress tracking types (for future use)
export interface ProgressMetric {
  id: string;
  userId: string;
  metric: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements';
  value: number;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface ProgressGoal {
  id: string;
  userId: string;
  type: 'weight_loss' | 'weight_gain' | 'strength' | 'endurance' | 'custom';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  isActive: boolean;
}

// Navigation types
export interface NavItem {
  name: string;
  path?: string; // Made optional to support both path and href
  href?: string; // Added href to support the snippet's interface
  icon?: React.ComponentType<any>;
  requiresAuth?: boolean;
}

// Theme types (for future theming support)
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Utility types for workouts
export type WorkoutGoal = WorkoutPlan['goal'];
export type WorkoutFitnessLevel = WorkoutPlan['fitnessLevel'];
export type WorkoutType = WorkoutPlan['workoutType'];
export type WorkoutPlanDuration = WorkoutPlan['planDuration'];
export type WorkoutDifficulty = WorkoutPlan['difficulty'];

// API response types for workouts
export interface GetWorkoutsResponse extends ApiResponse<WorkoutResponse> {}
export interface GetWorkoutResponse extends ApiResponse<{ workout: WorkoutPlan }> {}
export interface GetFilterOptionsResponse extends ApiResponse<{ filterOptions: WorkoutFilterOptions }> {}
export interface SearchWorkoutsResponse extends ApiResponse<{ suggestions: WorkoutSearchSuggestion[] }> {}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Common status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SortOrder = 'asc' | 'desc';
export type FilterPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';