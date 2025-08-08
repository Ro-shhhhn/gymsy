import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Trophy, 
  Target,
  Brain,
  BookOpen,
  LogOut,
  Activity,
  Heart,
  Dumbbell,
  Menu,
  X
} from 'lucide-react';
import { checkUserPreferences } from '../utils/api';

interface DashboardData {
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
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(data.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutNavigation = async (path: string) => {
    try {
      const hasPreferences = await checkUserPreferences();
      
      if (!hasPreferences) {
        // Redirect to preferences page with the intended destination
        navigate('/preferences', { 
          state: { 
            redirectPath: path,
            message: 'Please set up your fitness preferences first to get personalized workouts.' 
          } 
        });
      } else {
        // User has preferences, proceed to destination
        navigate(path);
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
      // If there's an error, still allow navigation but show a warning
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-700 mt-4 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-xl">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-cyan-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-cyan-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  GymSy
                </span>
                <span className="text-gray-700">AI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors duration-200 font-medium"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-cyan-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 text-gray-600 hover:text-cyan-600 p-3 rounded-xl hover:bg-cyan-50 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {getGreeting()}, {dashboardData.user.name}! 💪
              </h1>
              <p className="text-cyan-700 text-lg mb-4 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-4 border border-cyan-200/30">
                <p className="text-gray-700 font-medium italic">"{dashboardData.motivationalQuote}"</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {dashboardData.stats.currentStreak}
                </div>
                <div className="text-cyan-600 font-medium">Day Streak 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats.workoutsThisWeek}</p>
                <p className="text-cyan-700 text-sm">Workouts</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Time Trained</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats.totalHoursThisWeek}h</p>
                <p className="text-cyan-700 text-sm">This Week</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats.totalWorkouts}</p>
                <p className="text-cyan-700 text-sm">Workouts</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Level</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.user.fitnessLevel}</p>
                <p className="text-cyan-700 text-sm">Fitness</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => handleWorkoutNavigation('/ai-recommender')}
            className="group bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-600 group-hover:to-blue-700 rounded-2xl p-4 transition-all duration-300">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-2">🧠 AI Personalized Workout</h3>
                <p className="text-cyan-700">Let AI create the perfect workout plan tailored to your goals and fitness level.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleWorkoutNavigation('/workout-plans')}
            className="group bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 group-hover:from-blue-600 group-hover:to-cyan-700 rounded-2xl p-4 transition-all duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-2">📋 Explore Pre-Made Plans</h3>
                <p className="text-blue-700">Choose from our collection of professionally designed workout routines.</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity & Last Workout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Last Workout */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl mr-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Last Workout
              </h3>
              {dashboardData.lastWorkout ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                    <p className="text-gray-800 font-medium text-lg">{dashboardData.lastWorkout.name}</p>
                    <p className="text-cyan-600 text-sm font-medium">{dashboardData.lastWorkout.type}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <span className="text-gray-800 font-semibold">{dashboardData.lastWorkout.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Completed:</span>
                      <span className="text-gray-800 font-semibold">{formatDate(dashboardData.lastWorkout.completedAt)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl w-fit mx-auto mb-4">
                    <Heart className="h-12 w-12 text-cyan-600 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium">No workouts yet!</p>
                  <p className="text-gray-500 text-sm">Start your fitness journey today</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Recent Activity
              </h3>
              {dashboardData.recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentWorkouts.map((workout) => (
                    <div 
                      key={workout.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-xl hover:from-cyan-100/50 hover:to-blue-100/50 transition-all duration-300 border border-cyan-100/50"
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{workout.name}</p>
                        <p className="text-cyan-600 text-sm font-medium">{workout.type} • {workout.duration} min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm font-medium">{formatDate(workout.completedAt)}</p>
                        {workout.caloriesBurned && (
                          <p className="text-orange-500 text-xs font-semibold bg-orange-50 px-2 py-1 rounded-full">
                            {workout.caloriesBurned} cal
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-cyan-600 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium">No recent activity</p>
                  <p className="text-gray-500 text-sm">Your workout history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals Section */}
        {dashboardData.user.fitnessGoals.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/60 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl mr-3">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Your Fitness Goals
              </h3>
              <div className="flex flex-wrap gap-3">
                {dashboardData.user.fitnessGoals.map((goal, index) => (
                  <span 
                    key={index}
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 px-4 py-2 rounded-full text-sm border border-cyan-300/30 font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/50 rounded-2xl p-6 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl mx-auto w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
              <User className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-800 text-sm font-semibold">Profile</p>
          </button>

          <button
            onClick={() => navigate('/progress')}
            className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/50 rounded-2xl p-6 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mx-auto w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-800 text-sm font-semibold">Progress</p>
          </button>

          <button
            onClick={() => handleWorkoutNavigation('/workouts')}
            className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/50 rounded-2xl p-6 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mx-auto w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-800 text-sm font-semibold">Workouts</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="bg-white/60 hover:bg-white/80 backdrop-blur-md border border-cyan-200/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/50 rounded-2xl p-6 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mx-auto w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-800 text-sm font-semibold">Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;