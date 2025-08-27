// src/pages/WorkoutDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Target, Zap, Flame, Calendar, Star, 
  Users, Trophy, Dumbbell, Home, Heart, PlayCircle, 
  Bookmark, Share2, ChevronDown, ChevronUp, Info,
  TrendingUp, Activity, Award, CheckCircle, MapPin
} from 'lucide-react';
import { api, handleAuthError, ApiError } from '../utils/api';
import type { WorkoutPlan, Exercise } from '../types';


const WorkoutDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'exercises'>('overview');

  useEffect(() => {
    if (id) {
      fetchWorkoutDetails();
      checkIfSaved();
    }
  }, [id]);

  const fetchWorkoutDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.workouts.getWorkoutById(id);
      setWorkout(data.workout);
    } catch (error: any) {
      console.error('Error fetching workout details:', error);
      
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

  const checkIfSaved = async () => {
    if (!id) return;
    
    try {
      const data = await api.workouts.getSavedWorkouts();
      setIsSaved(data.savedWorkouts.includes(id));
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleStartWorkout = () => {
    // Updated to use workout._id if available, otherwise fallback to the id from params
    const workoutId = workout?._id || id;
    navigate(`/workout-session/${workoutId}`);
  };

  const handleSaveWorkout = async () => {
    if (!id) return;
    
    try {
      if (isSaved) {
        await api.workouts.removeSavedWorkout(id);
        setIsSaved(false);
      } else {
        const result = await api.workouts.saveWorkout(id);
        setIsSaved(result.isSaved);
      }
    } catch (error) {
      console.error('Error toggling workout save status:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && workout) {
      try {
        await navigator.share({
          title: workout.title,
          text: workout.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleWeekExpansion = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const getGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'fat loss': return <Flame className="h-5 w-5" />;
      case 'muscle gain': return <Dumbbell className="h-5 w-5" />;
      case 'strength': return <Trophy className="h-5 w-5" />;
      case 'endurance': return <TrendingUp className="h-5 w-5" />;
      case 'flexibility': return <Activity className="h-5 w-5" />;
      case 'general fitness': return <Target className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-green-700 bg-green-100 border-green-200';
      case 'intermediate': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'advanced': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home': return <Home className="h-5 w-5" />;
      case 'gym': return <Dumbbell className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const generateWeeklyPlan = (workout: WorkoutPlan) => {
    const planDurationWeeks = workout.planDuration === '2 weeks' ? 2 : 
                             workout.planDuration === '4 weeks' ? 4 : 
                             workout.planDuration === '6 weeks' ? 6 : 8;
    
    const weeklyPlan = [];
    
    for (let week = 1; week <= planDurationWeeks; week++) {
      const days = [];
      for (let day = 1; day <= 7; day++) {
        const isWorkoutDay = day <= workout.workoutsPerWeek;
        days.push({
          day,
          isWorkoutDay,
          workoutName: isWorkoutDay ? `${workout.focusAreas[0] || 'Full Body'} Training` : 'Rest Day',
          exercises: isWorkoutDay ? workout.exercises.slice(0, 4) : []
        });
      }
      weeklyPlan.push({ week, days });
    }
    
    return weeklyPlan;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-blue-700 font-medium">Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
            <Info className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Workout Not Found</h2>
          <p className="text-gray-600">{error || 'Failed to fetch workout details'}</p>
          <button
            onClick={() => navigate('/workout-plans')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const weeklyPlan = generateWeeklyPlan(workout);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          {workout.imageUrl ? (
            <img 
              src={workout.imageUrl} 
              alt={workout.title}
              className="w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        </div>
        
        <div className="relative z-10">
          {/* Navigation */}
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => navigate('/workout-plans')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Workouts</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveWorkout}
                className={`p-2 backdrop-blur-sm rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-red-500/90 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title Section */}
          <div className="px-6 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-white mb-4">{workout.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(workout.fitnessLevel)} bg-white`}>
                      {workout.fitnessLevel}
                    </span>
                    <div className="flex items-center space-x-2 text-white/90">
                      {getGoalIcon(workout.goal)}
                      <span className="font-medium">{workout.goal}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/90">
                      {getWorkoutTypeIcon(workout.workoutType)}
                      <span className="font-medium">{workout.workoutType}</span>
                    </div>
                    {workout.averageRating && workout.averageRating > 0 && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-white font-medium">
                          {workout.averageRating.toFixed(1)} ({workout.totalRatings})
                        </span>
                      </div>
                    )}
                  </div>
                  {workout.description && (
                    <p className="text-white/90 text-lg leading-relaxed mb-4">{workout.description}</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">{workout.duration}</div>
                  <div className="text-white/80 text-sm">minutes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Flame className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">{workout.caloriesBurnEstimate || 300}</div>
                  <div className="text-white/80 text-sm">calories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Calendar className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">{workout.planDuration}</div>
                  <div className="text-white/80 text-sm">duration</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <Users className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">{workout.workoutsPerWeek}</div>
                  <div className="text-white/80 text-sm">per week</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartWorkout}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                >
                  <PlayCircle className="h-6 w-6" />
                  <span>Start Workout Plan</span>
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 ${
                    isSaved 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Plan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'schedule', label: 'Weekly Schedule' },
            { id: 'exercises', label: 'Exercises' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 text-center rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Workout</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {workout.description || `This ${workout.planDuration} workout plan is designed for ${workout.fitnessLevel} level individuals looking to achieve ${workout.goal.toLowerCase()}. Perfect for ${workout.workoutType.toLowerCase()} workouts with a focus on ${workout.focusAreas.join(', ').toLowerCase()}.`}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Equipment Needed</h3>
                 <div className="flex items-center space-x-2 text-gray-600">
  {getWorkoutTypeIcon(workout.workoutType)}
  <span>{workout.workoutType} • {workout.equipment || 'Basic equipment'}</span>
</div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {workout.focusAreas.map((area, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Workout Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="font-bold text-gray-900">Intensity</div>
                  <div className="text-sm text-gray-600">{workout.fitnessLevel}</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="font-bold text-gray-900">Exercises</div>
                  <div className="text-sm text-gray-600">{workout.exercises.length} movements</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="font-bold text-gray-900">Created By</div>
                  <div className="text-sm text-gray-600">{workout.createdBy || 'Expert Trainer'}</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="font-bold text-gray-900">Rating</div>
                  <div className="text-sm text-gray-600">{workout.averageRating?.toFixed(1) || '4.5'}/5</div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            {workout.benefits && workout.benefits.length > 0 && (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {workout.benefits.map((benefit: string, index: number) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-gray-700">{benefit}</span>
        </div>
      ))}
    </div>
  </div>
)}
            {/* Tags */}
            {workout.tags && workout.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {workout.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {weeklyPlan.map(({ week, days }) => (
              <div key={week} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleWeekExpansion(week)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Week {week}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {workout.workoutsPerWeek} workout days, {7 - workout.workoutsPerWeek} rest days
                    </p>
                  </div>
                  {expandedWeeks.has(week) ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                
                {expandedWeeks.has(week) && (
                  <div className="px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {days.map(({ day, isWorkoutDay, workoutName }) => (
                        <div
                          key={day}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            isWorkoutDay 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`font-bold text-sm mb-2 ${
                              isWorkoutDay ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              Day {day}
                            </div>
                            <div className={`text-xs font-medium ${
                              isWorkoutDay ? 'text-blue-800' : 'text-gray-600'
                            }`}>
                              {workoutName}
                            </div>
                            {isWorkoutDay && (
                              <div className="mt-2 text-xs text-blue-600">
                                ~{workout.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise List</h2>
            <div className="space-y-4">
          {workout.exercises.map((exercise: Exercise, index: number) => (
  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-200 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
        {index + 1}
      </span>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
      <div>
        <span className="text-gray-500">Sets:</span>
        <span className="font-semibold text-gray-900 ml-2">{exercise.sets}</span>
      </div>
      {exercise.reps && (
        <div>
          <span className="text-gray-500">Reps:</span>
          <span className="font-semibold text-gray-900 ml-2">{exercise.reps}</span>
        </div>
      )}
      {exercise.duration && (
        <div>
          <span className="text-gray-500">Duration:</span>
          <span className="font-semibold text-gray-900 ml-2">{exercise.duration}s</span>
        </div>
      )}
      <div>
        <span className="text-gray-500">Rest:</span>
        <span className="font-semibold text-gray-900 ml-2">{exercise.restTime}s</span>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 mb-3">
      {exercise.targetMuscles.map((muscle: string, muscleIndex: number) => (
        <span key={muscleIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          {muscle}
        </span>
      ))}
    </div>
    
    {exercise.instructions && (
      <p className="text-gray-600 text-sm mt-3">{exercise.instructions}</p>
    )}
  </div>
))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetails;