import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { WorkoutSession } from '../models/WorkoutSession';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get dashboard data
router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user details
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current week's workout sessions
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get workout statistics
    const weeklyWorkouts = await WorkoutSession.find({
      userId,
      completedAt: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ completedAt: -1 });

    const totalWorkoutsThisWeek = weeklyWorkouts.length;
    const totalHoursThisWeek = weeklyWorkouts.reduce((total, session) => total + (session.duration || 0), 0) / 60; // Convert minutes to hours

    // Get last workout
    const lastWorkout = await WorkoutSession.findOne({ userId })
      .sort({ completedAt: -1 })
      .limit(1);

    // Get total workouts count
    const totalWorkouts = await WorkoutSession.countDocuments({ userId });

    // Get motivational quote (you can expand this with a quotes API or database)
    const motivationalQuotes = [
      "You don't find willpower, you create it.",
      "The only bad workout is the one that didn't happen.",
      "Your body can do it. It's your mind you need to convince.",
      "Progress, not perfection.",
      "Champions train, losers complain.",
      "Make yourself proud.",
      "Stronger than yesterday.",
      "Push yourself because no one else is going to do it for you."
    ];
    
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel || 'Beginner',
        fitnessGoals: user.fitnessGoals || []
      },
      stats: {
        workoutsThisWeek: totalWorkoutsThisWeek,
        totalHoursThisWeek: Math.round(totalHoursThisWeek * 10) / 10, // Round to 1 decimal
        totalWorkouts,
        currentStreak: await calculateCurrentStreak(userId)
      },
      lastWorkout: lastWorkout ? {
        name: lastWorkout.workoutName,
        type: lastWorkout.workoutType,
        completedAt: lastWorkout.completedAt,
        duration: lastWorkout.duration
      } : null,
      motivationalQuote: randomQuote,
      recentWorkouts: weeklyWorkouts.slice(0, 5).map(workout => ({
        id: workout._id,
        name: workout.workoutName,
        type: workout.workoutType,
        completedAt: workout.completedAt,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile/preferences
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('fitnessLevel')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid fitness level'),
  
  body('fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 500 })
    .withMessage('Weight must be between 30 and 500 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        fitnessGoals: user.fitnessGoals,
        age: user.age,
        weight: user.weight,
        height: user.height
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate current workout streak
async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    const workouts = await WorkoutSession.find({ userId })
      .sort({ completedAt: -1 })
      .select('completedAt');

    if (workouts.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of workouts) {
      const workoutDate = new Date(workout.completedAt);
      workoutDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

export default router;