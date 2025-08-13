// src/pages/WorkoutDetails.tsx - Enhanced Industrial Standard Workout Details Page
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Clock,
  Flame,
  Target,
  Calendar,
  Users,
  Star,
  Play,
  BookmarkPlus,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  Award,
  Activity,
  Heart,
  CheckCircle2,
  Timer,
  Dumbbell,
  TrendingUp,
  User,
  AlertCircle,
  Loader2,
  Eye,
  MessageCircle,
  Lock,
  Unlock,
  RotateCcw,
  Trophy,
  Zap,
  Shield,
  Home,
  Building2,
  Info,
  Volume2,
  Download,
  Upload,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Repeat,
  BarChart3,
  Flag,
  Camera,
  PlayCircle,
  Pause,
  SkipForward,
  History,
  Settings,
  Plus,
  Minus,
  Apple // Added missing import
} from 'lucide-react';
import { api, handleAuthError, ApiError } from '../utils/api';
import type { WorkoutPlan, Exercise, UserProgress as UserProgressType } from '../types';

// Enhanced interfaces for progress tracking
interface UserProgress {
  completedDays: Set<string>; // Format: "week-day" (e.g., "1-1", "1-2")
  completedWeeks: Set<number>;
  currentWeek: number;
  currentDay: number;
  lastCompletedDate: string | null;
  totalCompletedDays: number;
  consecutiveDays: number;
  isWorkoutStarted: boolean;
}

interface DayStatus {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  completedDate?: string;
}

interface WeekStatus {
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  completedDays: number;
  totalDays: number;
}

// Fixed interface for rating data
interface WorkoutRating {
  rating: number;
  review?: string;
}

const WorkoutDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [relatedWorkouts, setRelatedWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [startingWorkout, setStartingWorkout] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showNutritionTips, setShowNutritionTips] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  
  // FIX: Progress state - initially Week 1 Day 1 should NOT be completed
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedDays: new Set([]), // Empty - no days completed initially
    completedWeeks: new Set([]),
    currentWeek: 1,
    currentDay: 1,
    lastCompletedDate: null,
    totalCompletedDays: 0,
    consecutiveDays: 0,
    isWorkoutStarted: false // User hasn't started yet
  });

  // Fetch workout details
  useEffect(() => {
    if (!id) {
      setError('Invalid workout ID');
      setLoading(false);
      return;
    }

    fetchWorkoutDetails(id);
  }, [id]);

  // Fetch related workouts when workout is loaded
  useEffect(() => {
    if (workout?._id && !loadingRelated) {
      fetchRelatedWorkouts(workout._id);
    }
  }, [workout?._id]);

  const fetchWorkoutDetails = async (workoutId: string) => {
    try {
      setLoading(true);
      setError(null);

      // In real app, replace with actual API call
      const data = await api.workouts.getWorkoutDetails(workoutId);
      setWorkout(data.workout);
      
      // Simulate checking if workout is bookmarked
      setIsSaved(Math.random() > 0.7);

      // Load user progress
      await loadUserProgress(workoutId);

    } catch (error) {
      console.error('Fetch workout details error:', error);
      
      if (error instanceof ApiError) {
        handleAuthError(error);
        setError(error.message);
      } else {
        setError('Failed to load workout details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedWorkouts = async (workoutId: string) => {
    try {
      setLoadingRelated(true);
      const data = await api.workouts.getRelatedWorkouts(workoutId, 3);
      setRelatedWorkouts(data.relatedWorkouts);
    } catch (error) {
      console.error('Fetch related workouts error:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Load user progress (replace with actual API call)
  const loadUserProgress = async (workoutId: string) => {
    try {
      // This would be replaced with actual API call
      // For now, keep it empty to show fresh start
      // const progress = await api.workouts.getUserProgress(workoutId);
      // setUserProgress(progress);
    } catch (error) {
      console.error('Load user progress error:', error);
    }
  };

  const handleSaveWorkout = async () => {
    if (!workout || savingBookmark) return;

    try {
      setSavingBookmark(true);
      
      if (isSaved) {
        await api.workouts.removeBookmark(workout._id);
        setIsSaved(false);
      } else {
        await api.workouts.bookmarkWorkout(workout._id);
        setIsSaved(true);
      }
      
    } catch (error) {
      console.error('Save workout error:', error);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!workout || startingWorkout) return;

    // Check if user can start this workout
    const nextAvailable = getNextAvailableDay();
    if (!nextAvailable.canStart) {
      return;
    }

    try {
      setStartingWorkout(true);
      
      const data = await api.workouts.startWorkoutSession(workout._id);
      
      // Navigate to workout session page
      navigate(`/workout-session/${workout._id}`, {
        state: { 
          workout: data.workout,
          sessionId: data.sessionId,
          weekNumber: nextAvailable.week,
          dayNumber: nextAvailable.day
        }
      });
      
    } catch (error) {
      console.error('Start workout error:', error);
    } finally {
      setStartingWorkout(false);
    }
  };

  const handleShare = async () => {
    if (!workout) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: workout.title,
          text: workout.shortDescription || workout.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Show success message
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

 const handleRatingSubmit = async () => {
  if (!workout || !userRating) return;

  try {
    setSubmittingReview(true);
    
    // Use the correct API method signature with rating and optional review
    await api.workouts.rateWorkout(workout._id, userRating, userReview || undefined);
    
    setShowReviewForm(false);
    setUserRating(0);
    setUserReview('');
    // Refresh workout data to show updated rating
    await fetchWorkoutDetails(workout._id);
  } catch (error) {
    console.error('Rating submission error:', error);
    // Add user-friendly error handling
    alert('Failed to submit rating. Please try again.');
  } finally {
    setSubmittingReview(false);
  }
};



  // Calculate next available day for user
  const getNextAvailableDay = useCallback(() => {
    if (!userProgress.isWorkoutStarted) {
      return { week: 1, day: 1, canStart: true };
    }

    const { currentWeek, currentDay, completedDays } = userProgress;
    const currentDayKey = `${currentWeek}-${currentDay}`;
    
    if (completedDays.has(currentDayKey)) {
      // Find next incomplete day
      const nextDay = currentDay + 1;
      const maxDaysPerWeek = workout?.workoutsPerWeek || 7;
      
      if (nextDay <= maxDaysPerWeek) {
        return { week: currentWeek, day: nextDay, canStart: true };
      } else {
        // Next week
        return { week: currentWeek + 1, day: 1, canStart: true };
      }
    }
    
    return { week: currentWeek, day: currentDay, canStart: true };
  }, [userProgress, workout]);

  // Generate weekly schedule with progress tracking
  const generateWeeklySchedule = useMemo(() => {
    if (!workout) return [];

    const weeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
    const weeklyPlan = [];

    for (let week = 1; week <= weeks; week++) {
      const weekDays = [];
      const daysPerWeek = workout.workoutsPerWeek;
      
      for (let day = 1; day <= 7; day++) {
        const dayKey = `${week}-${day}`;
        const isWorkoutDay = day <= daysPerWeek;
        const isCompleted = userProgress.completedDays.has(dayKey);
        const isCurrentDay = week === userProgress.currentWeek && day === userProgress.currentDay && !userProgress.isWorkoutStarted;
        
        // Determine if day is unlocked
        let isUnlocked = false;
        if (week === 1 && day === 1) {
          // First day is always unlocked
          isUnlocked = true;
        } else if (week === userProgress.currentWeek) {
          // Current week - check if previous day is completed or this is the current day
          const prevDayKey = day === 1 ? `${week - 1}-${workout.workoutsPerWeek}` : `${week}-${day - 1}`;
          isUnlocked = day <= userProgress.currentDay || userProgress.completedDays.has(prevDayKey);
        } else if (week < userProgress.currentWeek || userProgress.completedWeeks.has(week)) {
          // Previous weeks are unlocked
          isUnlocked = true;
        }
        
        if (isWorkoutDay) {
          const workoutTypes = [
            'Upper Body Strength', 
            'Cardio + Core', 
            'Lower Body HIIT', 
            'Full Body Burn', 
            'Yoga Stretch',
            'Power Training',
            'Endurance Build'
          ];
          const workoutType = workoutTypes[(day - 1) % workoutTypes.length];
          
          weekDays.push({
            day,
            name: `Day ${day}`,
            type: workoutType,
            isRestDay: false,
            isCompleted,
            isUnlocked,
            isCurrentDay,
            exercises: workout.exercises.slice(0, Math.min(workout.exercises.length, 5))
          });
        } else {
          weekDays.push({
            day,
            name: `Day ${day}`,
            type: 'Rest & Recovery',
            isRestDay: true,
            isCompleted: true, // Rest days are always "completed"
            isUnlocked: true,
            isCurrentDay: false,
            exercises: []
          });
        }
      }
      
      // Calculate week status
      const completedWorkoutDays = weekDays.filter(d => !d.isRestDay && d.isCompleted).length;
      const totalWorkoutDays = weekDays.filter(d => !d.isRestDay).length;
      
      weeklyPlan.push({
        week,
        days: weekDays,
        isCompleted: completedWorkoutDays === totalWorkoutDays,
        isUnlocked: week <= userProgress.currentWeek + 1,
        completedDays: completedWorkoutDays,
        totalDays: totalWorkoutDays
      });
    }

    return weeklyPlan;
  }, [workout, userProgress]);

  const renderStarRating = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {!interactive && <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  const renderExerciseCard = (exercise: Exercise, index: number) => (
    <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">{exercise.name}</h4>
            {exercise.video && (
              <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <PlayCircle className="h-3 w-3 mr-1" />
                Video
              </span>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-lg">
              <Dumbbell className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{exercise.sets} sets</span>
            </span>
            {exercise.reps && (
              <span className="bg-green-50 px-2 py-1 rounded-lg font-medium text-green-700">
                {exercise.reps} reps
              </span>
            )}
            {exercise.duration && (
              <span className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-lg">
                <Timer className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-700">{exercise.duration}s</span>
              </span>
            )}
            <span className="flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700">{exercise.restTime}s rest</span>
            </span>
          </div>
          {exercise.targetMuscles && (
            <div className="flex flex-wrap gap-1 mb-3">
              {exercise.targetMuscles.slice(0, 3).map((muscle, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium"
                >
                  {muscle}
                </span>
              ))}
              {exercise.targetMuscles.length > 3 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium">
                  +{exercise.targetMuscles.length - 3} more
                </span>
              )}
            </div>
          )}
          {exercise.instructions && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{exercise.instructions}</p>
          )}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 font-medium">Equipment: </span>
              <span className="text-xs text-gray-600">{exercise.equipment.join(', ')}</span>
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          <button 
            onClick={() => {
              setPreviewExercise(exercise);
              setShowPreview(true);
            }}
            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors group">
            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors group">
            <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDayCard = (day: any, week: any) => {
    const dayKey = `${week.week}-${day.day}`;
    const isLocked = !day.isUnlocked && !day.isRestDay;
    
    return (
      <div key={day.day} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        day.isCurrentDay 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : day.isCompleted 
            ? 'border-green-300 bg-green-50'
            : isLocked
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}>
        <button
          onClick={() => !isLocked && setExpandedDay(expandedDay === day.day ? null : day.day)}
          disabled={isLocked}
          className="w-full flex items-center justify-between p-5 transition-colors disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              day.isCompleted 
                ? 'bg-green-500 text-white'
                : day.isCurrentDay
                  ? 'bg-blue-500 text-white'
                  : isLocked
                    ? 'bg-gray-300 text-gray-500'
                    : day.isRestDay
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
            }`}>
              {day.isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : isLocked ? (
                <Lock className="h-5 w-5" />
              ) : (
                day.day
              )}
              
              {day.isCurrentDay && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-yellow-800" />
                </div>
              )}
            </div>
            
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <p className={`font-semibold ${day.isCurrentDay ? 'text-blue-900' : 'text-gray-900'}`}>
                  {day.name}
                </p>
                {day.isCompleted && (
                  <Trophy className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className={`text-sm ${
                day.isCurrentDay ? 'text-blue-700' : isLocked ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {day.type}
              </p>
              {day.isCurrentDay && !day.isCompleted && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Ready to start!
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!day.isRestDay && !isLocked && (
              <span className={`text-sm ${day.isCurrentDay ? 'text-blue-700' : 'text-gray-500'}`}>
                {day.exercises.length} exercises
              </span>
            )}
            {!isLocked && (
              expandedDay === day.day ? (
                <ChevronUp className={`h-5 w-5 ${day.isCurrentDay ? 'text-blue-600' : 'text-gray-400'}`} />
              ) : (
                <ChevronDown className={`h-5 w-5 ${day.isCurrentDay ? 'text-blue-600' : 'text-gray-400'}`} />
              )
            )}
          </div>
        </button>

        {expandedDay === day.day && !day.isRestDay && !isLocked && (
          <div className="px-5 pb-5 border-t border-gray-200 bg-white">
            <div className="pt-4 space-y-4">
              {day.exercises.map((exercise: Exercise, index: number) => 
                renderExerciseCard(exercise, index)
              )}
            </div>
          </div>
        )}

        {expandedDay === day.day && day.isRestDay && (
          <div className="px-5 pb-5 border-t border-orange-200 bg-orange-50">
            <div className="pt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-orange-700 mb-3">
                <Heart className="h-5 w-5" />
                <span className="font-medium">Active Recovery Day</span>
              </div>
              <p className="text-sm text-orange-600 leading-relaxed">
                Light stretching, walking, or yoga recommended. Let your muscles recover and prepare for tomorrow's workout.
              </p>
            </div>
          </div>
        )}

        {isLocked && expandedDay === day.day && (
          <div className="px-5 pb-5 border-t border-gray-200 bg-gray-50">
            <div className="pt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 mb-3">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Workout Locked</span>
              </div>
              <p className="text-sm text-gray-600">
                Complete previous workouts to unlock this session.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Exercise Preview Modal
  const ExercisePreviewModal = ({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{exercise.name}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
          
          {exercise.video && (
            <div className="mb-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-gray-500" />
              <span className="ml-2 text-gray-600">Video Preview</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {exercise.sets} Sets
              </span>
              {exercise.reps && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {exercise.reps} Reps
                </span>
              )}
              {exercise.duration && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {exercise.duration}s
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {exercise.restTime}s Rest
              </span>
            </div>
            
            {exercise.instructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                <p className="text-gray-700 leading-relaxed">{exercise.instructions}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Target Muscles</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            
            {exercise.equipment && exercise.equipment.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Equipment Needed</h4>
                <p className="text-gray-700">{exercise.equipment.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-blue-700 font-medium text-lg">Loading workout details...</p>
              <p className="text-gray-600 text-sm">Getting everything ready for you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md mx-auto px-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Workout Not Found</h2>
              <p className="text-gray-600">{error || 'The workout you\'re looking for doesn\'t exist or has been removed.'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/workout-plans')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Workouts
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const weeklySchedule = generateWeeklySchedule;
  const totalWeeks = parseInt(workout.planDuration.split(' ')[0]) || 4;
  const nextAvailable = getNextAvailableDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-blue-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/workout-plans')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Workouts</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share this workout"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleSaveWorkout}
                disabled={savingBookmark}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {savingBookmark ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSaved ? (
                  <Bookmark className="h-4 w-4 text-blue-600" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isSaved ? 'Saved' : 'Save Plan'}
                </span>
              </button>

              <button
                onClick={handleStartWorkout}
                disabled={startingWorkout || !nextAvailable.canStart}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingWorkout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : userProgress.isWorkoutStarted ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {startingWorkout 
                    ? 'Starting...' 
                    : userProgress.isWorkoutStarted 
                      ? 'Continue Plan' 
                      : 'Start Plan'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Thumbnail Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="relative">
            {workout.imageUrl || workout.thumbnailUrl ? (
              <div className="h-64 md:h-80 relative">
                <img
                  src={workout.imageUrl || workout.thumbnailUrl}
                  alt={workout.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                {workout.videoUrl && (
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/20 transition-colors">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <Dumbbell className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold opacity-90">Workout Plan</h3>
                  <p className="text-blue-100 mt-2 opacity-75">Transform Your Body</p>
                </div>
                
                {/* Upload thumbnail option */}
                <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-white/20 transition-colors">
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className={`p-8 ${!workout.imageUrl && !workout.thumbnailUrl ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'relative -mt-20 z-10'}`}>
              {/* Progress Bar */}
              {userProgress.isWorkoutStarted && (
                <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/90">Your Progress</span>
                    <span className="text-sm font-bold text-white">
                      {Math.round((userProgress.totalCompletedDays / (totalWeeks * workout.workoutsPerWeek)) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(userProgress.totalCompletedDays / (totalWeeks * workout.workoutsPerWeek)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-white/80">
                    <span>{userProgress.totalCompletedDays} days completed</span>
                    <span>{userProgress.consecutiveDays} day streak</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                {workout.isFeatured && (
                  <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    <Award className="h-4 w-4" />
                    <span>Featured</span>
                  </span>
                )}
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  workout.fitnessLevel === 'Beginner' 
                    ? 'bg-green-100 text-green-800'
                    : workout.fitnessLevel === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {workout.fitnessLevel}
                </span>

                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {workout.goal}
                </span>

                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center space-x-1">
                  {workout.workoutType === 'Home' ? <Home className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                  <span>{workout.workoutType}</span>
                </span>

                {workout.isChallenge && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>Challenge</span>
                  </span>
                )}
              </div>

              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${(workout.imageUrl || workout.thumbnailUrl) ? 'text-white' : ''}`}>
                {workout.title}
              </h1>
              
              <p className={`text-lg mb-6 leading-relaxed ${(workout.imageUrl || workout.thumbnailUrl) ? 'text-gray-100' : 'text-blue-100'}`}>
                {workout.description}
              </p>

              <div className="flex items-center space-x-4 mb-4">
                {renderStarRating(workout.rating)}
                <span className={`text-sm ${(workout.imageUrl || workout.thumbnailUrl) ? 'text-gray-200' : 'text-blue-200'}`}>
                  ({workout.totalRatings} reviews)
                </span>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className={`text-sm underline hover:no-underline ${(workout.imageUrl || workout.thumbnailUrl) ? 'text-gray-200 hover:text-white' : 'text-blue-200 hover:text-white'}`}
                >
                  Rate this workout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Quick Stats Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Duration</p>
                    <p className="text-lg font-bold text-blue-900">{workout.planDuration}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Time/Day</p>
                    <p className="text-lg font-bold text-green-900">{workout.duration} min</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-600">Calories</p>
                    <p className="text-lg font-bold text-orange-900">{workout.caloriesBurnEstimate}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Focus</p>
                    <p className="text-sm font-bold text-purple-900">{workout.focusAreas[0]}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">Equipment:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {workout.workoutType === 'No Equipment' ? 'None Required' : workout.workoutType}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">Workouts/Week:</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {workout.workoutsPerWeek} days
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm text-gray-600 font-medium">Focus Areas:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {workout.focusAreas.map((area, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Plan Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Weekly Plan</h2>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
                    const weekStatus = weeklySchedule.find(w => w.week === week);
                    const isLocked = !weekStatus?.isUnlocked;
                    
                    return (
                      <button
                        key={week}
                        onClick={() => !isLocked && setActiveWeek(week)}
                        disabled={isLocked}
                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                          activeWeek === week
                            ? 'bg-blue-600 text-white'
                            : isLocked
                              ? 'bg-gray-100 text-gray-400'
                              : weekStatus?.isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isLocked && <Lock className="h-3 w-3 absolute top-1 right-1" />}
                        Week {week}
                        {weekStatus?.isCompleted && (
                          <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week Progress Summary */}
              {weeklySchedule[activeWeek - 1] && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Week {activeWeek} Progress
                    </h3>
                    <span className="text-sm font-medium text-gray-600">
                      {weeklySchedule[activeWeek - 1].completedDays} / {weeklySchedule[activeWeek - 1].totalDays} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        weeklySchedule[activeWeek - 1].isCompleted 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${(weeklySchedule[activeWeek - 1].completedDays / weeklySchedule[activeWeek - 1].totalDays) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {weeklySchedule[activeWeek - 1]?.days.map((day) => renderDayCard(day, weeklySchedule[activeWeek - 1]))}
              </div>
            </div>

            {/* Additional Information Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nutrition Tips */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <button
                  onClick={() => setShowNutritionTips(!showNutritionTips)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Apple className="h-5 w-5 text-green-600" />
                    <span>Nutrition Tips</span>
                  </h3>
                  {showNutritionTips ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                
                {showNutritionTips && (
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Eat a balanced meal 2-3 hours before your workout</p>
                    <p>• Stay hydrated throughout the day, especially during workouts</p>
                    <p>• Include protein in your post-workout meal for muscle recovery</p>
                    <p>• Consider a light snack 30-60 minutes before exercising</p>
                  </div>
                )}
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span>FAQ</span>
                  </h3>
                  {showFAQ ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                
                {showFAQ && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">Can I modify the exercises?</p>
                      <p className="text-sm text-gray-600">Yes! Feel free to substitute exercises that work the same muscle groups.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">What if I miss a day?</p>
                      <p className="text-sm text-gray-600">No worries! Just continue from where you left off. Consistency is key.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">How do I track progress?</p>
                      <p className="text-sm text-gray-600">The app automatically tracks your completed workouts and progress.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                <button
                  onClick={handleStartWorkout}
                  disabled={startingWorkout || !nextAvailable.canStart}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {startingWorkout ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : userProgress.isWorkoutStarted ? (
                    <RotateCcw className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span>
                    {startingWorkout 
                      ? 'Starting Workout...' 
                      : userProgress.isWorkoutStarted 
                        ? `Continue Week ${nextAvailable.week}, Day ${nextAvailable.day}` 
                        : 'Start This Plan'
                    }
                  </span>
                </button>

                {userProgress.isWorkoutStarted && (
                  <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Your progress is automatically saved
                  </div>
                )}

                <button
                  onClick={handleSaveWorkout}
                  disabled={savingBookmark}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 font-medium"
                >
                  {savingBookmark ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSaved ? (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Saved to My Plans</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4" />
                      <span>Save to My Plans</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Stats */}
            {userProgress.isWorkoutStarted && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Days Completed</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{userProgress.totalCompletedDays}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Current Streak</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{userProgress.consecutiveDays} days</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Current Week</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Week {userProgress.currentWeek}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Completion Rate</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {Math.round((userProgress.totalCompletedDays / (totalWeeks * workout.workoutsPerWeek)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Stats & Engagement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Completed by</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">1,247 users</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Reviews</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{workout.totalRatings}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Success Rate</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">87%</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created by</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{workout.createdBy}</span>
                </div>
              </div>
            </div>

            {/* Related Plans */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">You Might Also Like</h3>
              
              {loadingRelated ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {relatedWorkouts.map((relatedWorkout) => (
                    <div 
                      key={relatedWorkout._id} 
                      onClick={() => navigate(`/workout-plan/${relatedWorkout._id}`)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        relatedWorkout.thumbnailUrl || relatedWorkout.imageUrl 
                          ? 'bg-gray-200' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-400'
                      }`}>
                        {relatedWorkout.thumbnailUrl || relatedWorkout.imageUrl ? (
                          <img 
                            src={relatedWorkout.thumbnailUrl || relatedWorkout.imageUrl} 
                            alt={relatedWorkout.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Dumbbell className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {relatedWorkout.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {relatedWorkout.fitnessLevel} • {relatedWorkout.duration} min
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">
                            {relatedWorkout.averageRating || relatedWorkout.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No related workouts found
                </div>
              )}

              <button 
                onClick={() => navigate('/workout-plans')}
                className="w-full mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:bg-blue-50 rounded-lg"
              >
                View All Workout Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Preview Modal */}
      {showPreview && previewExercise && (
        <ExercisePreviewModal 
          exercise={previewExercise} 
          onClose={() => {
            setShowPreview(false);
            setPreviewExercise(null);
          }} 
        />
      )}

      {/* Rating/Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Rate This Workout</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex justify-center">
                  {renderStarRating(userRating, true, setUserRating)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Share your thoughts about this workout..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={!userRating || submittingReview}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submittingReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetails;