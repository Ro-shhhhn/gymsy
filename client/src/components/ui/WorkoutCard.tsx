// src/components/ui/WorkoutCard.tsx
import React, { useState } from 'react';
import { 
  Clock, 
  Target, 
  Zap, 
  Flame, 
  Calendar, 
  Star, 
  Eye,
  Heart,
  Dumbbell,
  Home,
  Users,
  Trophy,
  TrendingUp
} from 'lucide-react';
import type { WorkoutCardProps } from '../../types';

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onViewPlan,
  onSavePlan,
  isSaved = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-50 border-green-200';
      case 2: return 'text-lime-600 bg-lime-50 border-lime-200';
      case 3: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 4: return 'text-orange-600 bg-orange-50 border-orange-200';
      case 5: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Very Easy';
      case 2: return 'Easy';
      case 3: return 'Moderate';
      case 4: return 'Hard';
      case 5: return 'Very Hard';
      default: return 'Unknown';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'Fat Loss': return <Flame className="h-4 w-4" />;
      case 'Muscle Gain': return <Dumbbell className="h-4 w-4" />;
      case 'Strength': return <Trophy className="h-4 w-4" />;
      case 'Endurance': return <TrendingUp className="h-4 w-4" />;
      case 'Flexibility': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'Home': return <Home className="h-4 w-4" />;
      case 'Gym': return <Dumbbell className="h-4 w-4" />;
      case 'No Equipment': return <Users className="h-4 w-4" />;
      case 'Dumbbells/Bands Only': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getFitnessLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Advanced': return 'bg-purple-100 text-purple-700 border border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSavePlan) {
      onSavePlan(workout._id);
    }
  };

  const handleViewPlan = () => {
    onViewPlan(workout._id);
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewPlan}
    >
      {/* Featured Badge */}
      {workout.isFeatured && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
            <Star className="h-3 w-3 fill-current" />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Save Button */}
      {onSavePlan && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {workout.imageUrl && !imageError ? (
          <img
            src={workout.imageUrl}
            alt={workout.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">{workout.title}</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Difficulty badge on image */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(workout.difficulty)}`}>
            {getDifficultyLabel(workout.difficulty)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title and Fitness Level */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {workout.title}
            </h3>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getFitnessLevelBadgeColor(workout.fitnessLevel)}`}>
              {workout.fitnessLevel}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {workout.description}
          </p>
        </div>

        {/* Goal and Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-600">
            {getGoalIcon(workout.goal)}
            <span className="text-sm font-medium">{workout.goal}</span>
          </div>
          
          {workout.averageRating && workout.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {workout.averageRating}
              </span>
              <span className="text-xs text-gray-500">
                ({workout.totalRatings})
              </span>
            </div>
          )}
        </div>

        {/* Workout Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{workout.duration} min</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{workout.caloriesBurnEstimate} cal</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{workout.planDuration}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            {getWorkoutTypeIcon(workout.workoutType)}
            <span className="text-sm font-medium truncate">{workout.workoutType}</span>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Focus Areas</p>
          <div className="flex flex-wrap gap-2">
            {workout.focusAreas.slice(0, 3).map((area, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium"
              >
                {area}
              </span>
            ))}
            {workout.focusAreas.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                +{workout.focusAreas.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* View Plan Button */}
        <div className="pt-2">
          <button
            onClick={handleViewPlan}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform ${
              isHovered ? 'scale-[1.02] shadow-lg' : ''
            } flex items-center justify-center space-x-2 group`}
          >
            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>View Plan</span>
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};

export default WorkoutCard;