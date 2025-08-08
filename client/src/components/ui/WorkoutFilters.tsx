// src/components/ui/WorkoutFilters.tsx - Enhanced with better visibility
import React, { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  Target,
  Clock,
  Dumbbell,
  Home,
  Calendar,
  TrendingUp,
  Zap,
  Award,
  Activity
} from 'lucide-react';
import type { WorkoutFiltersProps } from '../../types';

const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleFocusAreasChange = (area: string) => {
    const currentAreas = filters.focusAreas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    
    handleFilterChange('focusAreas', newAreas);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm.trim() || undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.goal) count++;
    if (filters.fitnessLevel) count++;
    if (filters.workoutType) count++;
    if (filters.planDuration) count++;
    if (filters.focusAreas && filters.focusAreas.length > 0) count++;
    if (filters.minDuration || filters.maxDuration) count++;
    if (filters.search) count++;
    if (filters.featured) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Quick filter categories
  const quickFilters = [
    { 
      key: 'featured', 
      label: 'Featured Only', 
      icon: Award, 
      color: 'yellow',
      active: filters.featured,
      action: () => handleFilterChange('featured', !filters.featured || undefined)
    },
    { 
      key: 'quick', 
      label: 'Quick (≤30min)', 
      icon: Zap, 
      color: 'green',
      active: filters.maxDuration === 30,
      action: () => handleFilterChange('maxDuration', filters.maxDuration === 30 ? undefined : 30)
    },
    { 
      key: 'strength', 
      label: 'Strength', 
      icon: Dumbbell, 
      color: 'blue',
      active: filters.goal === 'Strength',
      action: () => handleFilterChange('goal', filters.goal === 'Strength' ? undefined : 'Strength')
    },
    { 
      key: 'cardio', 
      label: 'Fat Loss', 
      icon: Activity, 
      color: 'red',
      active: filters.goal === 'Fat Loss',
      action: () => handleFilterChange('goal', filters.goal === 'Fat Loss' ? undefined : 'Fat Loss')
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filters & Search</h3>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-blue-600 font-medium">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                </p>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Clear All</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            <Search className="inline h-4 w-4 mr-2" />
            Search Workouts
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, focus area, or goal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-20 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            <Zap className="inline h-4 w-4 mr-2" />
            Quick Filters
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              const colorClasses = {
                yellow: filter.active 
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' 
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
                green: filter.active 
                  ? 'bg-green-500 text-white border-green-500 shadow-md' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                blue: filter.active 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                red: filter.active 
                  ? 'bg-red-500 text-white border-red-500 shadow-md' 
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              };

              return (
                <button
                  key={filter.key}
                  onClick={filter.action}
                  className={`flex items-center space-x-2 px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${colorClasses[filter.color as keyof typeof colorClasses]}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fitness Goal */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <Target className="h-4 w-4" />
            <span>Fitness Goal</span>
          </label>
          <select
            value={filters.goal || ''}
            onChange={(e) => handleFilterChange('goal', e.target.value || undefined)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
          >
            <option value="">All Goals</option>
            {filterOptions.goals.map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>

        {/* Fitness Level */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <TrendingUp className="h-4 w-4" />
            <span>Fitness Level</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {filterOptions.fitnessLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleFilterChange('fitnessLevel', filters.fitnessLevel === level ? undefined : level)}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                  filters.fitnessLevel === level
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Environment */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <Home className="h-4 w-4" />
            <span>Workout Environment</span>
          </label>
          <select
            value={filters.workoutType || ''}
            onChange={(e) => handleFilterChange('workoutType', e.target.value || undefined)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
          >
            <option value="">All Environments</option>
            {filterOptions.workoutTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <span className="flex items-center space-x-2">
              <Dumbbell className="h-4 w-4" />
              <span>Advanced Filters</span>
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              showAdvancedFilters ? 'rotate-180' : ''
            }`} />
          </button>

          {showAdvancedFilters && (
            <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
              {/* Plan Duration */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>Plan Duration</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.planDurations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleFilterChange('planDuration', filters.planDuration === duration ? undefined : duration)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                        filters.planDuration === duration
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Range */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>Workout Duration (minutes)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Minimum</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      placeholder="10"
                      value={filters.minDuration || ''}
                      onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Maximum</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      placeholder="120"
                      value={filters.maxDuration || ''}
                      onChange={(e) => handleFilterChange('maxDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Activity className="h-4 w-4" />
                  <span>Target Body Parts</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {filterOptions.focusAreas.map((area) => (
                    <label key={area} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors group">
                      <input
                        type="checkbox"
                        checked={(filters.focusAreas || []).includes(area)}
                        onChange={() => handleFocusAreasChange(area)}
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium transition-colors">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.goal && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Goal: {filters.goal}
                  <button
                    onClick={() => handleFilterChange('goal', undefined)}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.fitnessLevel && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Level: {filters.fitnessLevel}
                  <button
                    onClick={() => handleFilterChange('fitnessLevel', undefined)}
                    className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.workoutType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Environment: {filters.workoutType}
                  <button
                    onClick={() => handleFilterChange('workoutType', undefined)}
                    className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured Only
                  <button
                    onClick={() => handleFilterChange('featured', undefined)}
                    className="ml-2 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

  );
};
  export default WorkoutFilters;