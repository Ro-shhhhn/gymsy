import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Grid3x3, List, Loader2, AlertCircle, Search, RefreshCw,
  Zap, Target, Flame, Dumbbell, Award, Clock, Filter, TrendingUp
} from 'lucide-react';
import WorkoutCard from '../components/ui/WorkoutCard';
import WorkoutFilters from '../components/ui/WorkoutFilters';
import { api, handleAuthError, ApiError } from '../utils/api';
import type { 
  WorkoutPlan, WorkoutFilters as WorkoutFiltersType, 
  WorkoutSortOptions, WorkoutFilterOptions, WorkoutResponse 
} from '../types';

// Consolidated category definitions
const WORKOUT_CATEGORIES = {
  challenges: { title: "🏆 Challenges", description: "Push your limits", icon: Award, filters: { featured: true } },
  hiit: { title: "🔥 HIIT Workouts", description: "High-intensity training", icon: Zap, filters: { search: "hiit" } },
  bodyFocus: { 
    title: "🎯 Body Focus", description: "Target specific muscles", icon: Target,
    subcategories: [
      { name: "Abs Beginner", filters: { focusAreas: ["Core", "Abs"], fitnessLevel: "Beginner" } },
      { name: "Arms Intermediate", filters: { focusAreas: ["Arms"], fitnessLevel: "Intermediate" } },
      { name: "Legs Advanced", filters: { focusAreas: ["Legs"], fitnessLevel: "Advanced" } },
      { name: "Full Body", filters: { focusAreas: ["Full Body"] } }
    ]
  },
  workoutTypes: { 
    title: "💪 Workout Types", description: "Choose your training style", icon: Dumbbell,
    subcategories: [
      { name: "Keep Fit", filters: { goal: "General Fitness" } },
      { name: "Stretch & Flexibility", filters: { goal: "Flexibility" } },
      { name: "Strength Training", filters: { goal: "Strength" } },
      { name: "Fat Loss", filters: { goal: "Fat Loss" } },
      { name: "Muscle Gain", filters: { goal: "Muscle Gain" } }
    ]
  },
  popularGoals: { title: "⭐ Popular Goals", description: "Most sought-after objectives", icon: TrendingUp, filters: { goal: "Fat Loss" } },
  quickWorkouts: { title: "⚡ Quick Workouts", description: "Short but effective", icon: Clock, filters: { maxDuration: 30 } }
};

const PremadeWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Consolidated state
  const [state, setState] = useState({
    allWorkouts: [] as WorkoutPlan[],
    categorizedWorkouts: {} as {[key: string]: WorkoutPlan[]},
    loading: true,
    error: null as string | null,
    showFilters: false,
    viewMode: 'grid' as 'grid' | 'list',
    activeCategory: 'all',
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    savedWorkouts: new Set<string>()
  });

  const [filters, setFilters] = useState<WorkoutFiltersType>({});
  const [sortOptions, setSortOptions] = useState<WorkoutSortOptions>({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [filterOptions, setFilterOptions] = useState<WorkoutFilterOptions>({
    goals: [], fitnessLevels: [], workoutTypes: [], focusAreas: [], planDurations: []
  });

  const limit = 50;

  // Categorize workouts utility
  const categorizeWorkouts = (workouts: WorkoutPlan[]) => {
    const categorized = Object.keys(WORKOUT_CATEGORIES).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as {[key: string]: WorkoutPlan[]});

    workouts.forEach(workout => {
      if (workout.isFeatured) categorized.challenges.push(workout);
      if (workout.tags.some(tag => tag.toLowerCase().includes('hiit')) || 
          workout.title.toLowerCase().includes('hiit')) categorized.hiit.push(workout);
      if (workout.focusAreas.some(area => ['Core', 'Abs', 'Arms', 'Legs', 'Full Body'].includes(area))) categorized.bodyFocus.push(workout);
      categorized.workoutTypes.push(workout);
      if (workout.goal === 'Fat Loss') categorized.popularGoals.push(workout);
      if (workout.duration <= 30) categorized.quickWorkouts.push(workout);
    });

    setState(prev => ({ ...prev, categorizedWorkouts: categorized }));
  };

  // Fetch workouts
  const fetchWorkouts = useCallback(async (page: number = 1) => {
    try {
      if (state.loading && state.allWorkouts.length === 0) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortOptions.sortBy,
        sortOrder: sortOptions.sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''))
      });

      // Handle array filters
      if (filters.focusAreas?.length) {
        filters.focusAreas.forEach(area => queryParams.append('focusAreas', area));
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/premade?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new ApiError(data.message || 'Failed to fetch workouts', response.status);

      const workoutData: WorkoutResponse = data.data;
      
      setState(prev => ({
        ...prev,
        allWorkouts: workoutData.workouts,
        currentPage: workoutData.pagination.currentPage,
        totalPages: workoutData.pagination.totalPages,
        totalCount: workoutData.pagination.totalCount
      }));

      categorizeWorkouts(workoutData.workouts);

    } catch (error) {
      console.error('Fetch workouts error:', error);
      
      if (error instanceof ApiError) {
        handleAuthError(error);
        setState(prev => ({ ...prev, error: error.message }));
      } else {
        setState(prev => ({ ...prev, error: 'Failed to load workouts. Please try again.' }));
      }
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [filters, sortOptions, state.allWorkouts.length, state.loading]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/filter-options`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.data?.filterOptions) {
        setFilterOptions(data.data.filterOptions);
      }
    } catch (error) {
      console.error('Fetch filter options error:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchWorkouts(1);
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, [filters, sortOptions]);

  useEffect(() => {
    if (location.state?.message) console.log(location.state.message);
  }, [location]);

  // Event handlers
  const handleFilterChange = (newFilters: WorkoutFiltersType) => {
    setFilters(newFilters);
    setState(prev => ({ ...prev, currentPage: 1, activeCategory: 'all' }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setState(prev => ({ ...prev, currentPage: 1, activeCategory: 'all' }));
  };

  const handleSortChange = (newSortOptions: WorkoutSortOptions) => {
    setSortOptions(newSortOptions);
    setState(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleViewPlan = (workoutId: string) => navigate(`/workout-plan/${workoutId}`);

  const handleSavePlan = async (workoutId: string) => {
    setState(prev => {
      const newSaved = new Set(prev.savedWorkouts);
      newSaved.has(workoutId) ? newSaved.delete(workoutId) : newSaved.add(workoutId);
      return { ...prev, savedWorkouts: newSaved };
    });
  };

  const handleCategoryFilter = (categoryKey: string, categoryFilters?: WorkoutFiltersType) => {
    if (categoryKey === 'all') {
      setFilters({});
      setState(prev => ({ ...prev, activeCategory: 'all' }));
    } else {
      setFilters(categoryFilters || {});
      setState(prev => ({ ...prev, activeCategory: categoryKey }));
    }
    setState(prev => ({ ...prev, currentPage: 1 }));
  };

  const toggleShowFilters = () => setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  const toggleViewMode = (mode: 'grid' | 'list') => setState(prev => ({ ...prev, viewMode: mode }));
  const handleRefresh = () => fetchWorkouts(state.currentPage);

  // Render category section
  const renderCategorySection = (categoryKey: string, category: any) => {
    const workouts = state.categorizedWorkouts[categoryKey] || [];
    if (workouts.length === 0) return null;

    const Icon = category.icon;
    const maxDisplay = state.viewMode === 'grid' ? 6 : 4;

    return (
      <div key={categoryKey} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          </div>
          
          <button
            onClick={() => handleCategoryFilter(categoryKey, category.filters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            <span>View All</span>
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {category.subcategories && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category.subcategories.map((subcat: any, index: number) => (
              <button
                key={index}
                onClick={() => handleCategoryFilter(`${categoryKey}_${index}`, subcat.filters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                {subcat.name}
              </button>
            ))}
          </div>
        )}

        <div className={state.viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {workouts.slice(0, maxDisplay).map((workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onViewPlan={handleViewPlan}
              onSavePlan={handleSavePlan}
              isSaved={state.savedWorkouts.has(workout._id)}
              className={state.viewMode === 'list' ? 'max-w-full' : ''}
            />
          ))}
        </div>

        {workouts.length > maxDisplay && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleCategoryFilter(categoryKey, category.filters)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              See {workouts.length - maxDisplay} more workouts in this category
            </button>
          </div>
        )}
      </div>
    );
  };

  // Get current workouts
  const getCurrentWorkouts = () => {
    return state.activeCategory === 'all' ? state.allWorkouts : (state.categorizedWorkouts[state.activeCategory] || []);
  };

  // Loading state
  if (state.loading && state.allWorkouts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-blue-700 font-medium text-lg">Loading workout plans...</p>
              <p className="text-gray-600 text-sm">Finding the perfect workouts for you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeFiltersCount = Object.keys(filters).filter(key => filters[key as keyof WorkoutFiltersType]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-blue-200/50 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Pre-Made Workouts
                  </h1>
                  <p className="text-sm text-gray-600">
                    {state.totalCount > 0 ? `${state.totalCount} professional workout plans` : 'Discover workout plans'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Category Navigation */}
                <div className="hidden lg:flex items-center space-x-2">
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      state.activeCategory === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    All
                  </button>
                </div>

                {/* Controls */}
                <button
                  onClick={handleRefresh}
                  disabled={state.loading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${state.loading ? 'animate-spin' : ''}`} />
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  {(['grid', 'list'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => toggleViewMode(mode)}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        state.viewMode === mode 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {mode === 'grid' ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                    </button>
                  ))}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={toggleShowFilters}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    state.showFilters 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {state.showFilters && (
              <div className="lg:w-80 space-y-6">
                <WorkoutFilters
                  filters={filters}
                  filterOptions={filterOptions}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Error State */}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <h3 className="font-medium text-red-800">Error Loading Workouts</h3>
                      <p className="text-sm text-red-600 mt-1">{state.error}</p>
                      <button
                        onClick={handleRefresh}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              {state.activeCategory === 'all' ? (
                <div className="space-y-8">
                  {Object.entries(WORKOUT_CATEGORIES).map(([key, category]) => 
                    renderCategorySection(key, category)
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {state.activeCategory === 'all' ? 'All Workouts' : WORKOUT_CATEGORIES[state.activeCategory as keyof typeof WORKOUT_CATEGORIES]?.title || 'Filtered Results'}
                    </h2>
                    <div className="text-sm text-gray-600">
                      {getCurrentWorkouts().length} workouts
                    </div>
                  </div>

                  <div className={state.viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {getCurrentWorkouts().map((workout) => (
                      <WorkoutCard
                        key={workout._id}
                        workout={workout}
                        onViewPlan={handleViewPlan}
                        onSavePlan={handleSavePlan}
                        isSaved={state.savedWorkouts.has(workout._id)}
                        className={state.viewMode === 'list' ? 'max-w-full' : ''}
                      />
                    ))}
                  </div>

                  {getCurrentWorkouts().length === 0 && !state.loading && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="space-y-4">
                        <Search className="h-16 w-16 text-gray-300 mx-auto" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">No workouts found</h3>
                          <p className="text-gray-600 mt-2 max-w-md mx-auto">
                            Try adjusting your filters or search terms to find more workout plans.
                          </p>
                        </div>
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <span>Clear All Filters</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading More */}
              {state.loading && state.allWorkouts.length > 0 && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-600 font-medium">Loading more workouts...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremadeWorkouts;