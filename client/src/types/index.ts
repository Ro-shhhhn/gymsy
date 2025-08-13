// src/types/index.ts - Enhanced with Progress Tracking Types
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

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoals?: string[];
  age?: number;
  weight?: number;
  height?: number;
  targetWeight?: number;
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  hasPreferences?: boolean;
  timeAvailability?: {
    minutesPerDay: number;
    daysPerWeek: number;
  };
  planDuration?: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  workoutEnvironment?: 'Home' | 'Gym' | 'No equipment' | 'With dumbbells/bands only';
  createdAt: string;
  updatedAt: string;
}

// Exercise interface
export interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime: number;
  instructions?: string;
  targetMuscles: string[];
  equipment?: string[];
  video?: string;
  image?: string;
}

// Enhanced Progress Tracking Types
export interface CompletedDay {
  week: number;
  day: number;
  completedAt: string;
  duration: number;
  caloriesBurned?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes?: string;
  sessionId?: string;
}

export interface UserProgress {
  isStarted: boolean;
  isCompleted: boolean;
  isBookmarked: boolean;
  completionPercentage: number;
  currentWeek: number;
  currentDay: number;
  totalCompletedDays: number;
  consecutiveDays: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  totalCaloriesBurned: number;
  completedDays: CompletedDay[];
  completedWeeks: number[];
  lastWorkoutDate?: string;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  userRating?: number;
  userReview?: string;
  ratedAt?: string;
  bookmarkedAt?: string;
  reminderTime?: string;
  isReminderEnabled: boolean;
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
}

export interface DayStatus {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  completedDate?: string;
}

export interface WeekStatus {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  completedDays: number;
  totalDays: number;
  completionPercentage: number;
}

export interface WorkoutDay {
  day: number;
  name: string;
  type: string;
  isRestDay: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrentDay: boolean;
  exercises: Exercise[];
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
  isCompleted: boolean;
  isUnlocked: boolean;
  completedDays: number;
  totalDays: number;
}

// Enhanced WorkoutPlan interface
export interface WorkoutPlan {
  _id: string;
  id?: string;
  name?: string;
  title: string;
  description: string;
  shortDescription?: string;
  goal: 'Fat Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'Flexibility' | 'General Fitness';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  focusAreas: string[];
  workoutType: 'Home' | 'Gym' | 'No Equipment' | 'Dumbbells/Bands Only';
  caloriesBurnEstimate: number;
  planDuration: '2 weeks' | '4 weeks' | '6 weeks' | '8+ weeks';
  
  // Enhanced categorization
  category?: 'Challenge' | 'HIIT' | 'Strength' | 'Cardio' | 'Flexibility' | 'Beginner' | 'Quick' | 'General';
  subcategory?: string;
  workoutStyle?: 'Circuit' | 'Traditional' | 'AMRAP' | 'EMOM' | 'Tabata' | 'Pyramid' | 'Ladder' | 'Custom';
  
  exercises: Exercise[];
  workoutsPerWeek: number;
  schedule?: Array<{
    day: number;
    exercises: number[];
  }>;
  
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  seoKeywords?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  rating: number;
  totalRatings: number;
  averageRating?: number;
  totalExercises?: number;
  estimatedCompletionTime?: number;
  
  // Legacy fields
  targetGoals?: string[];
  
  createdBy: 'Admin' | 'AI' | 'Professional' | 'Community';
  creatorId?: string;
  isPublished: boolean;
  isFeatured: boolean;
  isChallenge?: boolean;
  isPremium?: boolean;
  
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastModifiedBy?: string;
  
  // User progress data (when fetched with user context)
  userProgress?: UserProgress | null;
}

// Workout Session interface
export interface WorkoutSession {
  id: string;
  userId: string;
  workoutName: string;
  workoutType: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Full Body' | 'Core' | 'Custom';
  exercises: Exercise[];
  duration: number;
  caloriesBurned?: number;
  completedAt: string;
  notes?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isCompleted: boolean;
}

// Progress Overview Types
export interface ProgressStats {
  totalWorkouts: number;
  startedWorkouts: number;
  completedWorkouts: number;
  bookmarkedWorkouts: number;
  totalTimeSpent: number;
  totalCaloriesBurned: number;
  totalCompletedDays: number;
  averageRating: number;
  longestStreak: number;
}

export interface RecentActivity {
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
}

export interface ProgressOverview {
  stats: ProgressStats;
  recentActivity: RecentActivity[];
}

// Workout Details specific interfaces
export interface WorkoutDetailsResponse {
  success: boolean;
  message: string;
  data: {
    workout: WorkoutPlan;
  };
}

export interface RelatedWorkoutsResponse {
  success: boolean;
  message: string;
  data: {
    relatedWorkouts: WorkoutPlan[];
    count: number;
  };
}

export interface WorkoutBookmarkResponse {
  success: boolean;
  message: string;
  data: {
    workoutId: string;
    isBookmarked: boolean;
  };
}

export interface WorkoutSessionStartResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    workoutId: string;
    startedAt: string;
    currentWeek: number;
    currentDay: number;
    workout: {
      title: string;
      exercises: Exercise[];
      duration: number;
      caloriesBurnEstimate: number;
    };
  };
}

export interface WorkoutDayCompletionResponse {
  success: boolean;
  message: string;
  data: {
    workoutId: string;
    week: number;
    day: number;
    completionPercentage: number;
    currentStreak: number;
    totalCompletedDays: number;
    isWorkoutCompleted: boolean;
  };
}

export interface WorkoutRatingResponse {
  success: boolean;
  message: string;
  data: {
    workoutId: string;
    rating: number;
    review?: string;
  };
}

export interface WorkoutProgressResponse {
  success: boolean;
  message: string;
  data: {
    hasProgress: boolean;
    progress?: UserProgress;
  };
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
  category?: string;
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
  categories: string[];
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
  showProgress?: boolean;
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

// Workout Details Page Props
export interface WorkoutDetailsPageProps {
  className?: string;
}

// Progress Components Props
export interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

export interface StreakBadgeProps {
  streak: number;
  longestStreak: number;
  className?: string;
}

export interface ProgressStatsProps {
  progress: UserProgress;
  workout: WorkoutPlan;
  className?: string;
}

export interface WorkoutDayCardProps {
  day: WorkoutDay;
  week: WorkoutWeek;
  onDayClick?: (week: number, day: number) => void;
  onStartDay?: (week: number, day: number) => void;
  className?: string;
}

export interface WeekSelectorProps {
  weeks: WorkoutWeek[];
  activeWeek: number;
  onWeekChange: (week: number) => void;
  className?: string;
}

// Workout Session Types
export interface WorkoutSessionState {
  sessionId: string;
  workoutId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  sessionStartTime: string;
  totalDuration: number;
  completedExercises: number;
  estimatedCaloriesBurned: number;
  isPaused: boolean;
  notes: string;
}

export interface ExerciseProgress {
  exerciseIndex: number;
  completedSets: number;
  totalSets: number;
  isCompleted: boolean;
  actualReps?: number[];
  actualWeights?: number[];
  actualDuration?: number;
  notes?: string;
}

export interface SessionSummary {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  duration: number;
  caloriesBurned: number;
  completedExercises: number;
  totalExercises: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes: string;
  completedAt: string;
  exerciseProgress: ExerciseProgress[];
}

// Mouse interaction types
export interface MousePosition {
  x: number;
  y: number;
}

// Progress tracking types for charts/analytics
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

// Notification Types
export interface WorkoutReminder {
  id: string;
  userId: string;
  workoutId: string;
  reminderTime: string;
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  message?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'time' | 'consistency' | 'milestone';
  requirement: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Social Features Types (for future implementation)
export interface WorkoutComment {
  id: string;
  userId: string;
  workoutId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLikedByUser: boolean;
}

export interface WorkoutLike {
  id: string;
  userId: string;
  workoutId: string;
  likedAt: string;
}

export interface UserFollowing {
  id: string;
  followerId: string;
  followingId: string;
  followedAt: string;
}

// Advanced Filtering Types
export interface AdvancedFilters extends WorkoutFilters {
  hasUserProgress?: boolean;
  progressStatus?: 'not_started' | 'in_progress' | 'completed';
  isBookmarked?: boolean;
  minRating?: number;
  maxRating?: number;
  createdBy?: string[];
  tags?: string[];
  muscleGroups?: string[];
  equipment?: string[];
  caloriesRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: AdvancedFilters;
  isDefault: boolean;
  createdAt: string;
}

// Analytics Types
export interface WorkoutAnalytics {
  totalWorkouts: number;
  totalTime: number;
  totalCalories: number;
  averageWorkoutDuration: number;
  averageCaloriesPerWorkout: number;
  mostActiveDay: string;
  favoriteWorkoutType: string;
  consistencyScore: number;
  improvementRate: number;
  weeklyProgress: Array<{
    week: string;
    workouts: number;
    duration: number;
    calories: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    workouts: number;
    duration: number;
    calories: number;
  }>;
}

export interface PerformanceMetrics {
  strengthGains: {
    exercise: string;
    initialWeight: number;
    currentWeight: number;
    improvement: number;
    improvementPercentage: number;
  }[];
  enduranceGains: {
    exercise: string;
    initialDuration: number;
    currentDuration: number;
    improvement: number;
    improvementPercentage: number;
  }[];
  consistencyMetrics: {
    totalPlannedDays: number;
    totalCompletedDays: number;
    consistencyPercentage: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// Navigation types
export interface NavItem {
  name: string;
  path?: string;
  href?: string;
  icon?: React.ComponentType<any>;
  requiresAuth?: boolean;
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

// Theme types
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
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Settings Types
export interface UserSettings {
  notifications: {
    workoutReminders: boolean;
    weeklyReports: boolean;
    achievements: boolean;
    socialUpdates: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showWorkouts: boolean;
    allowMessages: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    units: {
      weight: 'kg' | 'lbs';
      distance: 'km' | 'miles';
      temperature: 'celsius' | 'fahrenheit';
    };
  };
}

// Error Handling Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  action?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Utility types for workouts
export type WorkoutGoal = WorkoutPlan['goal'];
export type WorkoutFitnessLevel = WorkoutPlan['fitnessLevel'];
export type WorkoutType = WorkoutPlan['workoutType'];
export type WorkoutPlanDuration = WorkoutPlan['planDuration'];
export type WorkoutDifficulty = WorkoutPlan['difficulty'];
export type WorkoutCategory = WorkoutPlan['category'];

// API response types for workouts
export interface GetWorkoutsResponse extends ApiResponse<WorkoutResponse> {}
export interface GetWorkoutResponse extends ApiResponse<{ workout: WorkoutPlan }> {}
export interface GetFilterOptionsResponse extends ApiResponse<{ filterOptions: WorkoutFilterOptions }> {}
export interface SearchWorkoutsResponse extends ApiResponse<{ suggestions: WorkoutSearchSuggestion[] }> {}
export interface GetProgressOverviewResponse extends ApiResponse<ProgressOverview> {}
export interface GetBookmarksResponse extends ApiResponse<{
  bookmarkedWorkouts: WorkoutPlan[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {}

// Form Data Types
export interface WorkoutDayCompletionData {
  week: number;
  day: number;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  caloriesBurned?: number;
  notes?: string;
  sessionId?: string;
}

export interface WorkoutRatingData {
  rating: number;
  review?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SortOrder = 'asc' | 'desc';
export type FilterPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type WorkoutCreator = 'Admin' | 'AI' | 'Professional' | 'Community';

// Hook Return Types
export interface UseWorkoutDetailsReturn {
  workout: WorkoutPlan | null;
  userProgress: UserProgress | null;
  relatedWorkouts: WorkoutPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  startWorkout: () => Promise<void>;
  completeDay: (data: WorkoutDayCompletionData) => Promise<void>;
  rateWorkout: (data: WorkoutRatingData) => Promise<void>;
  toggleBookmark: () => Promise<void>;
}

export interface UseWorkoutProgressReturn {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  updateProgress: (data: Partial<UserProgress>) => Promise<void>;
  getDayStatus: (week: number, day: number) => DayStatus;
  getWeekStatus: (week: number) => WeekStatus;
  getNextAvailableDay: () => { week: number; day: number } | null;
}

export interface UseWorkoutFiltersReturn {
  filters: WorkoutFilters;
  filterOptions: WorkoutFilterOptions;
  loading: boolean;
  setFilter: (key: keyof WorkoutFilters, value: any) => void;
  clearFilters: () => void;
  applyPreset: (preset: FilterPreset) => void;
}

// Event Types
export interface WorkoutStartEvent {
  workoutId: string;
  workoutTitle: string;
  week: number;
  day: number;
  timestamp: string;
}

export interface WorkoutCompleteEvent {
  workoutId: string;
  workoutTitle: string;
  week: number;
  day: number;
  duration: number;
  caloriesBurned: number;
  difficulty: DifficultyLevel;
  timestamp: string;
}

export interface WorkoutPauseEvent {
  sessionId: string;
  pausedAt: string;
  totalDuration: number;
}

export interface WorkoutResumeEvent {
  sessionId: string;
  resumedAt: string;
  pausedDuration: number;
}

// Subscription Types (for future real-time features)
export interface WorkoutSubscription {
  userId: string;
  workoutId: string;
  events: ('start' | 'complete' | 'pause' | 'resume' | 'bookmark')[];
  callback: (event: any) => void;
}

// Export all types as a namespace for better organization
export namespace WorkoutTypes {
  export type Plan = WorkoutPlan;
  export type Progress = UserProgress;
  export type Session = WorkoutSession;
  export type Day = WorkoutDay;
  export type Week = WorkoutWeek;
  export type ExerciseType = Exercise; // ✅ Renamed to avoid circular reference
  export type Filters = WorkoutFilters;
  export type Analytics = WorkoutAnalytics;
}

export namespace ProgressTypes {
  export type Stats = ProgressStats;
  export type Overview = ProgressOverview;
  export type Metrics = PerformanceMetrics;
  export type Status = ProgressStatus;
  export type CompletedDayType = CompletedDay; // ✅ Renamed to avoid circular reference
}

export namespace UITypes {
  export type Loading = LoadingState;
  export type ThemeType = Theme; // ✅ Renamed to avoid circular reference
  export type NavItemType = NavItem; // ✅ Renamed to avoid circular reference
  export type Breadcrumb = BreadcrumbItem;
}

// Constants for type safety
export const WORKOUT_GOALS = [
  'Fat Loss',
  'Muscle Gain', 
  'Strength',
  'Endurance',
  'Flexibility',
  'General Fitness'
] as const;

export const FITNESS_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced'
] as const;

export const WORKOUT_TYPES = [
  'Home',
  'Gym',
  'No Equipment',
  'Dumbbells/Bands Only'
] as const;

export const PLAN_DURATIONS = [
  '2 weeks',
  '4 weeks',
  '6 weeks',
  '8+ weeks'
] as const;

export const DIFFICULTY_LEVELS = [
  'Easy',
  'Medium',
  'Hard'
] as const;

export const WORKOUT_CATEGORIES = [
  'Challenge',
  'HIIT',
  'Strength',
  'Cardio',
  'Flexibility',
  'Beginner',
  'Quick',
  'General'
] as const;

export const FOCUS_AREAS = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Core',
  'Arms',
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Glutes',
  'Abs',
  'Cardio',
  'Calves',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quads',
  'Hamstrings',
  'Hip Flexors'
] as const;