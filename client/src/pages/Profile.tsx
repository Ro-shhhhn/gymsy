import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Target, 
  TrendingUp, 
  Calendar,
  Weight,
  Ruler,
  Save,
  Check,
  X
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoals: string[];
  age?: number;
  weight?: number;
  height?: number;
  targetWeight?: number;
  activityLevel?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const fitnessLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const activityLevelOptions = [
    'Sedentary',
    'Lightly Active', 
    'Moderately Active',
    'Very Active',
    'Extremely Active'
  ];
  
  const commonGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength Building',
    'Endurance',
    'General Fitness',
    'Flexibility',
    'Stress Relief',
    'Better Sleep',
    'Increase Energy',
    'Body Toning'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        throw new Error(data.message || 'Failed to fetch profile data');
      }

      setProfile(data.data.user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          fitnessLevel: profile.fitnessLevel,
          fitnessGoals: profile.fitnessGoals,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          targetWeight: profile.targetWeight,
          activityLevel: profile.activityLevel
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile(data.user);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    if (!profile) return;
    
    const updatedGoals = profile.fitnessGoals.includes(goal)
      ? profile.fitnessGoals.filter(g => g !== goal)
      : [...profile.fitnessGoals, goal];
    
    setProfile({ ...profile, fitnessGoals: updatedGoals });
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-xl font-bold text-white">Profile Settings</div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center">
            <X className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500/20 rounded-full p-4">
                <User className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-purple-200">{profile.email}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="h-5 w-5 text-purple-400 mr-2" />
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg px-3 py-2">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-white bg-white/5 rounded-lg px-3 py-2 flex-1">{profile.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Age</label>
                {editMode ? (
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={profile.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-white bg-white/5 rounded-lg px-3 py-2 flex-1">
                      {profile.age ? `${profile.age} years` : 'Not specified'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Stats */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-400 mr-2" />
                Physical Stats
              </h3>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Weight (kg)</label>
                {editMode ? (
                  <input
                    type="number"
                    min="30"
                    max="500"
                    step="0.1"
                    value={profile.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Weight className="h-4 w-4 text-gray-400" />
                    <p className="text-white bg-white/5 rounded-lg px-3 py-2 flex-1">
                      {profile.weight ? `${profile.weight} kg` : 'Not specified'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Height (cm)</label>
                {editMode ? (
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={profile.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <p className="text-white bg-white/5 rounded-lg px-3 py-2 flex-1">
                      {profile.height ? `${profile.height} cm` : 'Not specified'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Target Weight (kg)</label>
                {editMode ? (
                  <input
                    type="number"
                    min="30"
                    max="500"
                    step="0.1"
                    value={profile.targetWeight || ''}
                    onChange={(e) => handleInputChange('targetWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <p className="text-white bg-white/5 rounded-lg px-3 py-2 flex-1">
                      {profile.targetWeight ? `${profile.targetWeight} kg` : 'Not specified'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fitness Level */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Fitness Level</h3>
            {editMode ? (
              <div className="grid grid-cols-3 gap-4">
                {fitnessLevelOptions.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleInputChange('fitnessLevel', level)}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.fitnessLevel === level
                        ? 'bg-purple-600/30 border-purple-400 text-white'
                        : 'bg-white/5 border-purple-500/30 text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            ) : (
              <div className="inline-block bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full border border-purple-500/30">
                {profile.fitnessLevel}
              </div>
            )}
          </div>

          {/* Fitness Goals */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Fitness Goals</h3>
            {editMode ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      profile.fitnessGoals.includes(goal)
                        ? 'bg-purple-600/30 border-purple-400 text-white'
                        : 'bg-white/5 border-purple-500/30 text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.fitnessGoals.length > 0 ? (
                  profile.fitnessGoals.map((goal, index) => (
                    <span 
                      key={index}
                      className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                    >
                      {goal}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No goals specified</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;