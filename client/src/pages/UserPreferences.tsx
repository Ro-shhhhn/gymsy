import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Target, 
  Activity, 
  Clock, 
  Calendar, 
  Home, 
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Scale,
  Ruler,
  Heart,
  TrendingUp,
  Save,
  AlertCircle,
  Sparkles,
  Users,
  MapPin
} from 'lucide-react';

interface UserPreferences {
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

const UserPreferences: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectPath = location.state?.redirectPath || '/workout-plans';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [preferences, setPreferences] = useState<UserPreferences>({
    height: 170,
    weight: 70,
    age: undefined,
    fitnessLevel: 'Beginner',
    activityLevel: 'Moderately Active',
    fitnessGoals: [],
    timeAvailability: {
      minutesPerDay: 30,
      daysPerWeek: 3
    },
    planDuration: '4 weeks',
    workoutEnvironment: 'Gym'
  });

  const totalSteps = 8;

  // Available options
  const fitnessLevels = [
    { 
      value: 'Beginner', 
      icon: '🌱',
      description: 'New to fitness or returning after a break'
    },
    { 
      value: 'Intermediate', 
      icon: '🏃',
      description: 'Regular exercise routine, familiar with basic movements'
    },
    { 
      value: 'Advanced', 
      icon: '💪',
      description: 'Experienced with complex movements and high intensity'
    }
  ];

  const activityLevels = [
    { value: 'Sedentary', icon: '🛋️', description: 'Little to no physical activity' },
    { value: 'Lightly Active', icon: '🚶', description: 'Light exercise/sports 1-3 days/week' },
    { value: 'Moderately Active', icon: '🏃', description: 'Moderate exercise/sports 3-5 days/week' },
    { value: 'Very Active', icon: '⚡', description: 'Hard exercise/sports 6-7 days/week' },
    { value: 'Extremely Active', icon: '🔥', description: 'Very hard exercise, physical job, or training twice a day' }
  ];

  const fitnessGoalOptions = [
    { value: 'Lose Fat', icon: '🔥' },
    { value: 'Gain Muscle', icon: '💪' },
    { value: 'Build Strength', icon: '🏋️' },
    { value: 'Improve Endurance', icon: '🏃' },
    { value: 'Increase Flexibility', icon: '🧘' },
    { value: 'Maintain Fitness', icon: '⚖️' }
  ];

  const planDurations = [
    { value: '2 weeks', icon: '⚡', description: 'Quick start program' },
    { value: '4 weeks', icon: '🎯', description: 'Most popular choice', popular: true },
    { value: '6 weeks', icon: '📈', description: 'Balanced approach' },
    { value: '8+ weeks', icon: '🏆', description: 'Long-term commitment' }
  ];

  const workoutEnvironments = [
    { 
      value: 'Home', 
      icon: '🏠',
      description: 'Bodyweight and minimal equipment'
    },
    { 
      value: 'Gym', 
      icon: '🏋️',
      description: 'Full access to gym equipment'
    },
    { 
      value: 'No equipment', 
      icon: '🤸',
      description: 'Bodyweight exercises only'
    },
    { 
      value: 'With dumbbells/bands only', 
      icon: '🔗',
      description: 'Basic home equipment'
    }
  ];

  useEffect(() => {
    fetchExistingPreferences();
  }, []);

  const fetchExistingPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/preferences/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.hasPreferences) {
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error('Error fetching existing preferences:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!preferences.height || preferences.height < 100 || preferences.height > 250) {
          newErrors.height = 'Please enter a valid height between 100-250 cm';
        }
        if (!preferences.weight || preferences.weight < 30 || preferences.weight > 200) {
          newErrors.weight = 'Please enter a valid weight between 30-200 kg';
        }
        if (preferences.age && (preferences.age < 13 || preferences.age > 100)) {
          newErrors.age = 'Age must be between 13-100 years';
        }
        break;
      case 2:
        if (!preferences.fitnessLevel) {
          newErrors.fitnessLevel = 'Please select your fitness level';
        }
        break;
      case 3:
        if (!preferences.activityLevel) {
          newErrors.activityLevel = 'Please select your activity level';
        }
        break;
      case 4:
        if (preferences.fitnessGoals.length === 0) {
          newErrors.fitnessGoals = 'Please select at least one fitness goal';
        }
        break;
      case 5:
        if (!preferences.timeAvailability.minutesPerDay) {
          newErrors.timeAvailability = 'Please set your time availability';
        }
        break;
      case 6:
        if (!preferences.planDuration) {
          newErrors.planDuration = 'Please select a plan duration';
        }
        break;
      case 7:
        if (!preferences.workoutEnvironment) {
          newErrors.workoutEnvironment = 'Please select your workout environment';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
    const allErrors: {[key: string]: string} = {};

    // Validate all steps
    if (!preferences.height || preferences.height < 100 || preferences.height > 250) {
      allErrors.height = 'Please enter a valid height between 100-250 cm';
    }
    if (!preferences.weight || preferences.weight < 30 || preferences.weight > 200) {
      allErrors.weight = 'Please enter a valid weight between 30-200 kg';
    }
    if (preferences.age && (preferences.age < 13 || preferences.age > 100)) {
      allErrors.age = 'Age must be between 13-100 years';
    }
    if (!preferences.fitnessLevel) {
      allErrors.fitnessLevel = 'Please select your fitness level';
    }
    if (!preferences.activityLevel) {
      allErrors.activityLevel = 'Please select your activity level';
    }
    if (preferences.fitnessGoals.length === 0) {
      allErrors.fitnessGoals = 'Please select at least one fitness goal';
    }
    if (!preferences.timeAvailability.minutesPerDay) {
      allErrors.timeAvailability = 'Please set your time availability';
    }
    if (!preferences.planDuration) {
      allErrors.planDuration = 'Please select a plan duration';
    }
    if (!preferences.workoutEnvironment) {
      allErrors.workoutEnvironment = 'Please select your workout environment';
    }

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleGoalToggle = (goal: string) => {
    setPreferences(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
    if (errors.fitnessGoals) {
      setErrors(prev => ({ ...prev, fitnessGoals: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      // Show error message about missing preferences
      setErrors(prev => ({
        ...prev,
        submit: 'Please complete all preferences before proceeding. Check all steps for any missing information.'
      }));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/preferences/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save preferences');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate(redirectPath, { 
        state: { 
          message: 'Preferences saved successfully! Now you can explore workouts tailored for you.' 
        } 
      });

    } catch (error) {
      console.error('Error saving preferences:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-blue-600">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm font-medium text-blue-600">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderErrorMessage = (field: string) => {
    if (errors[field]) {
      return (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Ruler className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Measurements</h2>
              <p className="text-gray-600">Help us create a personalized workout plan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={preferences.height || ''}
                  onChange={(e) => {
                    setPreferences(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }));
                    if (errors.height) setErrors(prev => ({ ...prev, height: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.height ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="170"
                />
                {renderErrorMessage('height')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={preferences.weight || ''}
                  onChange={(e) => {
                    setPreferences(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }));
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.weight ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="70"
                />
                {renderErrorMessage('weight')}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Age (optional)</label>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={preferences.age || ''}
                  onChange={(e) => {
                    setPreferences(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }));
                    if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                  }}
                  className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="25"
                />
                {renderErrorMessage('age')}
              </div>
            </div>

            {preferences.height && preferences.weight && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">BMI: {(preferences.weight / ((preferences.height / 100) ** 2)).toFixed(1)}</p>
                    <p className="text-sm text-blue-600">This helps us recommend appropriate workout intensity</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitness Level</h2>
              <p className="text-gray-600">This helps us set the right intensity</p>
            </div>

            <div className="space-y-4">
              {fitnessLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    setPreferences(prev => ({ ...prev, fitnessLevel: level.value as any }));
                    if (errors.fitnessLevel) setErrors(prev => ({ ...prev, fitnessLevel: '' }));
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    preferences.fitnessLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{level.value}</h3>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                    {preferences.fitnessLevel === level.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {renderErrorMessage('fitnessLevel')}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Level</h2>
              <p className="text-gray-600">How active are you in daily life?</p>
            </div>

            <div className="space-y-3">
              {activityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    setPreferences(prev => ({ ...prev, activityLevel: level.value as any }));
                    if (errors.activityLevel) setErrors(prev => ({ ...prev, activityLevel: '' }));
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    preferences.activityLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{level.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{level.value}</h3>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                    {preferences.activityLevel === level.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {renderErrorMessage('activityLevel')}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitness Goals</h2>
              <p className="text-gray-600">Select all that apply to you</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fitnessGoalOptions.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    preferences.fitnessGoals.includes(goal.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <h3 className="font-medium text-gray-900 text-sm">{goal.value}</h3>
                  {preferences.fitnessGoals.includes(goal.value) && (
                    <CheckCircle className="h-4 w-4 text-blue-500 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>

            {preferences.fitnessGoals.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">
                    {preferences.fitnessGoals.length} goal{preferences.fitnessGoals.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
            )}
            {renderErrorMessage('fitnessGoals')}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Commitment</h2>
              <p className="text-gray-600">How much time can you dedicate?</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Minutes per workout session</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={preferences.timeAvailability.minutesPerDay}
                    onChange={(e) => {
                      setPreferences(prev => ({
                        ...prev,
                        timeAvailability: {
                          ...prev.timeAvailability,
                          minutesPerDay: parseInt(e.target.value)
                        }
                      }));
                      if (errors.timeAvailability) setErrors(prev => ({ ...prev, timeAvailability: '' }));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center">
                    <span className="text-xl font-bold text-blue-600">
                      {preferences.timeAvailability.minutesPerDay} minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>15 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Workout days per week</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={preferences.timeAvailability.daysPerWeek}
                    onChange={(e) => {
                      setPreferences(prev => ({
                        ...prev,
                        timeAvailability: {
                          ...prev.timeAvailability,
                          daysPerWeek: parseInt(e.target.value)
                        }
                      }));
                      if (errors.timeAvailability) setErrors(prev => ({ ...prev, timeAvailability: '' }));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center">
                    <span className="text-xl font-bold text-blue-600">
                      {preferences.timeAvailability.daysPerWeek} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 day</span>
                    <span>4 days</span>
                    <span>7 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-800">
                    Total: {preferences.timeAvailability.minutesPerDay * preferences.timeAvailability.daysPerWeek} minutes/week
                  </p>
                  <p className="text-sm text-blue-600">
                    ({Math.round((preferences.timeAvailability.minutesPerDay * preferences.timeAvailability.daysPerWeek) / 60 * 10) / 10} hours total)
                  </p>
                </div>
              </div>
            </div>
            {renderErrorMessage('timeAvailability')}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Duration</h2>
              <p className="text-gray-600">How long should your program run?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {planDurations.map((duration) => (
                <div key={duration.value} className="relative">
                  {duration.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setPreferences(prev => ({ ...prev, planDuration: duration.value as any }));
                      if (errors.planDuration) setErrors(prev => ({ ...prev, planDuration: '' }));
                    }}
                    className={`w-full p-6 rounded-lg border-2 text-center transition-colors ${
                      preferences.planDuration === duration.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{duration.icon}</div>
                    <h3 className="font-semibold text-gray-900">{duration.value}</h3>
                    <p className="text-sm text-gray-600 mt-1">{duration.description}</p>
                    {preferences.planDuration === duration.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500 mx-auto mt-2" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            {renderErrorMessage('planDuration')}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout Environment</h2>
              <p className="text-gray-600">Where will you be exercising?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutEnvironments.map((env) => (
                <button
                  key={env.value}
                  onClick={() => {
                    setPreferences(prev => ({ ...prev, workoutEnvironment: env.value as any }));
                    if (errors.workoutEnvironment) setErrors(prev => ({ ...prev, workoutEnvironment: '' }));
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    preferences.workoutEnvironment === env.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{env.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{env.value}</h3>
                      <p className="text-sm text-gray-600">{env.description}</p>
                      {preferences.workoutEnvironment === env.value && (
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-2" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {renderErrorMessage('workoutEnvironment')}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Complete</h2>
              <p className="text-gray-600">Review your preferences before creating your plan</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-lg font-semibold">Your Fitness Profile</h3>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Ruler className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Body Stats</h4>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Height: {preferences.height} cm</p>
                      <p>Weight: {preferences.weight} kg</p>
                      {preferences.age && <p>Age: {preferences.age} years</p>}
                      <p className="text-blue-600 font-medium">
                        BMI: {(preferences.weight / ((preferences.height / 100) ** 2)).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Fitness Level</h4>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{preferences.fitnessLevel}</p>
                      <p className="text-gray-600">{preferences.activityLevel}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Time & Duration</h4>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>{preferences.timeAvailability.minutesPerDay} min/session</p>
                      <p>{preferences.timeAvailability.daysPerWeek} days/week</p>
                      <p className="font-medium text-blue-600">{preferences.planDuration}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Environment</h4>
                    </div>
                    <p className="text-sm font-medium">{preferences.workoutEnvironment}</p>
                  </div>

                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Fitness Goals</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.fitnessGoals.map((goal) => (
                        <span 
                          key={goal}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Ready to Start!</h4>
                      <p className="text-sm text-green-700">
                        Your personalized {preferences.planDuration.toLowerCase()} workout plan will be created
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GymSy AI</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 md:p-8">
            {renderProgressBar()}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Creating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create My Plan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            border: 2px solid white;
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
            background: #e5e7eb;
          }

          .slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: #e5e7eb;
            border: none;
          }

          .slider:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }

          .slider:focus::-moz-range-thumb {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
        `
      }} />
    </div>
  );
};

export default UserPreferences;