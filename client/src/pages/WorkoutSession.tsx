// src/pages/WorkoutSession.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, Check, Share2, Save, ArrowLeft } from 'lucide-react';
import type { WorkoutPlan, Exercise } from '../types';
import { api } from '../utils/api';

interface SessionExercise extends Exercise {
  completed: boolean;
  currentSet: number;
}

interface SessionState {
  currentExerciseIndex: number;
  isActive: boolean;
  isPaused: boolean;
  isResting: boolean;
  restTimeLeft: number;
  exerciseTimeLeft: number;
  totalTime: number;
  exercises: SessionExercise[];
}

// Exercise images mapping (you can move this to a separate constants file)
const exerciseImages: Record<string, string[]> = {
  "Standard Push-ups": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  ],
  "Squats": [
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  ],
  "Plank Hold": [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  ],
  "Bicycle Crunches": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  ],
  // Add more exercise images as needed
};

const WorkoutSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  
  const [session, setSession] = useState<SessionState>({
    currentExerciseIndex: 0,
    isActive: false,
    isPaused: false,
    isResting: false,
    restTimeLeft: 0,
    exerciseTimeLeft: 0,
    totalTime: 0,
    exercises: []
  });

  // Fetch workout data
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        if (!id) {
          setError('Workout ID not found');
          return;
        }
        
        const response = await api.workouts.getWorkoutById(id);
        setWorkout(response.workout);
        
        // Initialize session exercises
        setSession(prev => ({
          ...prev,
          exercises: response.workout.exercises.map(exercise => ({
            ...exercise,
            completed: false,
            currentSet: 1
          }))
        }));
      } catch (err) {
        console.error('Failed to fetch workout:', err);
        setError('Failed to load workout');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (session.isActive && !session.isPaused) {
      interval = setInterval(() => {
        setSession(prev => {
          const newSession = { ...prev };
          
          // Increment total time
          newSession.totalTime += 1;
          
          if (newSession.isResting && newSession.restTimeLeft > 0) {
            // Rest countdown
            newSession.restTimeLeft -= 1;
            if (newSession.restTimeLeft === 0) {
              newSession.isResting = false;
            }
          } else if (!newSession.isResting && newSession.exerciseTimeLeft > 0) {
            // Exercise countdown (for timed exercises)
            newSession.exerciseTimeLeft -= 1;
          }
          
          return newSession;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentExercise = (): SessionExercise | null => {
    return session.exercises[session.currentExerciseIndex] || null;
  };

  const startWorkout = () => {
    setSession(prev => {
      const newSession = { ...prev, isActive: true, isPaused: false };
      const currentEx = newSession.exercises[newSession.currentExerciseIndex];
      
      // Set exercise timer if it's a timed exercise
      if (currentEx && currentEx.duration && !currentEx.reps) {
        newSession.exerciseTimeLeft = currentEx.duration;
      }
      
      return newSession;
    });
  };

  const togglePause = () => {
    setSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const completeSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    setSession(prev => {
      const newSession = { ...prev };
      const exercise = newSession.exercises[newSession.currentExerciseIndex];
      
      if (exercise.currentSet < exercise.sets) {
        // More sets to go - start rest timer
        exercise.currentSet += 1;
        newSession.isResting = true;
        newSession.restTimeLeft = exercise.restTime || 20;
        
        // Reset exercise timer if timed exercise
        if (exercise.duration && !exercise.reps) {
          newSession.exerciseTimeLeft = exercise.duration;
        }
      } else {
        // Exercise completed
        exercise.completed = true;
        nextExercise(newSession);
      }
      
      return newSession;
    });
  };

  const nextExercise = (sessionState = session) => {
    if (sessionState.currentExerciseIndex < sessionState.exercises.length - 1) {
      setSession(prev => {
        const newSession = { ...prev };
        newSession.currentExerciseIndex += 1;
        newSession.isResting = false;
        newSession.restTimeLeft = 0;
        
        // Reset current set for new exercise
        const nextEx = newSession.exercises[newSession.currentExerciseIndex];
        nextEx.currentSet = 1;
        
        // Set exercise timer if needed
        newSession.exerciseTimeLeft = (nextEx.duration && !nextEx.reps) ? nextEx.duration : 0;
        
        return newSession;
      });
    } else {
      // Workout complete
      completeWorkout();
    }
  };

  const skipExercise = () => {
    setSession(prev => {
      const newSession = { ...prev };
      newSession.exercises[newSession.currentExerciseIndex].completed = true;
      return newSession;
    });
    nextExercise();
  };

  const completeWorkout = () => {
    setSession(prev => ({ ...prev, isActive: false }));
    setShowSummary(true);
  };

  const saveWorkout = async () => {
    try {
      const completedExercises = session.exercises.filter(ex => ex.completed);
      const caloriesBurned = Math.round((session.totalTime / 60) * 8); // Rough estimate
      
      await api.workouts.createWorkoutSession({
        workoutName: workout?.title || 'Custom Workout',
        workoutType: workout?.workoutType || 'Custom',
        exercises: completedExercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          duration: ex.duration,
          restTime: ex.restTime
        })),
        duration: Math.round(session.totalTime / 60),
        caloriesBurned,
        difficulty: workout?.difficulty === 1 ? 'Easy' : workout?.difficulty === 2 ? 'Medium' : 'Hard'
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Workout not found'}</h1>
          <button 
            onClick={() => navigate('/workout-plans')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = getCurrentExercise();
  const progress = session.exercises.length > 0 ? 
    ((session.currentExerciseIndex / session.exercises.length) * 100) : 0;
  const completedExercises = session.exercises.filter(ex => ex.completed).length;
  const exerciseImgs = exerciseImages[currentExercise?.name || ''] || exerciseImages["Standard Push-ups"];

  // Summary Screen
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Workout Complete!</h1>
            <p className="text-purple-200">Great job finishing your session</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
              <span className="text-purple-200">Duration</span>
              <span className="font-semibold">{formatTime(session.totalTime)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
              <span className="text-purple-200">Exercises Completed</span>
              <span className="font-semibold">{completedExercises}/{session.exercises.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
              <span className="text-purple-200">Calories Burned</span>
              <span className="font-semibold">~{Math.round((session.totalTime / 60) * 8)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveWorkout}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Progress
            </button>
            <button
              onClick={() => {/* Share functionality */}}
              className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-white mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-purple-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold">{workout.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-purple-200">
            <span>Exercise {session.currentExerciseIndex + 1} of {session.exercises.length}</span>
            <span className={session.isActive ? 'animate-pulse' : ''}>
              {formatTime(session.totalTime)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Exercise Card */}
        {currentExercise && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white mb-6">
            {/* Exercise Images */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={exerciseImgs[0]}
                  alt={`${currentExercise.name} step 1`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={exerciseImgs[1]}
                  alt={`${currentExercise.name} step 2`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">{currentExercise.name}</h2>
            
            {/* Exercise Info */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{currentExercise.sets}</div>
                <div className="text-sm text-purple-200">Sets</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">
                  {currentExercise.reps ? `${currentExercise.reps}` : `${currentExercise.duration}s`}
                </div>
                <div className="text-sm text-purple-200">
                  {currentExercise.reps ? 'Reps' : 'Duration'}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{currentExercise.restTime}s</div>
                <div className="text-sm text-purple-200">Rest</div>
              </div>
            </div>

            {/* Current Set Info */}
            <div className="text-center mb-4">
              <div className="text-lg">
                Set {currentExercise.currentSet} of {currentExercise.sets}
              </div>
              {session.isResting && (
                <div className="text-yellow-400 font-semibold animate-pulse">
                  Rest: {formatTime(session.restTimeLeft)}
                </div>
              )}
            </div>

            {/* Exercise Timer (for timed exercises) */}
            {session.exerciseTimeLeft > 0 && (
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-400 animate-pulse">
                  {formatTime(session.exerciseTimeLeft)}
                </div>
                <div className="text-sm text-purple-200">Exercise Time</div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          {!session.isActive ? (
            <button
              onClick={startWorkout}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <Play className="h-5 w-5" />
              Start Workout
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={togglePause}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {session.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {session.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={skipExercise}
                  className="bg-gray-600 hover:bg-gray-700 p-3 rounded-lg transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={completeSet}
                disabled={session.isResting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
              >
                <Check className="h-5 w-5" />
                {session.isResting ? 'Resting...' : 'Complete Set'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;