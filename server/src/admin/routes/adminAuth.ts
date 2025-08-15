import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { adminAuth } from '../middleware/adminAuth'; // Import the middleware
import adminWorkoutRoutes from './adminWorkoutRoutes'; // Import workout routes

const router = express.Router();

// Admin Login
// Admin Authentication Routes
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.loginCount = (admin.loginCount || 0) + 1;
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
          loginCount: admin.loginCount
        },
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});
// Verify token route
router.get('/verify', adminAuth, async (req: any, res) => {
  try {
    const admin = req.admin;
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
          loginCount: admin.loginCount
        },
        isValid: true
      }
    });
  } catch (error: any) {
    console.error('Admin verify token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during token verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh token route
router.post('/refresh', adminAuth, async (req: any, res) => {
  try {
    const admin = req.admin;

    // Generate new JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      }
    });
  } catch (error: any) {
    console.error('Admin refresh token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during token refresh',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current admin profile
router.get('/profile', adminAuth, async (req: any, res) => {
  try {
    const admin = await Admin.findById(req.admin._id)
      .select('-password')
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin
      }
    });
  } catch (error: any) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while retrieving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update admin profile
router.put('/profile', adminAuth, async (req: any, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.admin._id;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if email is already taken by another admin
    const existingAdmin = await Admin.findOne({ 
      email, 
      _id: { $ne: adminId } 
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { name, email, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: updatedAdmin
      }
    });
  } catch (error: any) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password
router.put('/change-password', adminAuth, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin._id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isValidPassword = await admin.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    admin.password = hashedPassword;
    admin.updatedAt = new Date();
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change admin password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout route (optional - mainly for logging)
router.post('/logout', adminAuth, async (req: any, res) => {
  try {
    // Update last logout time
    await Admin.findByIdAndUpdate(req.admin._id, {
      lastLogout: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Admin logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Dashboard stats route
router.get('/dashboard/stats', adminAuth, async (req: any, res) => {
  try {
    // Import here to avoid circular dependencies
    const { Workout } = await import('../../models/Workout');
    const { User } = await import('../../models/User'); // Fixed import path

    // Get basic workout stats
    const [
      totalWorkouts,
      publishedWorkouts,
      featuredWorkouts,
      totalUsers,
      // Add more stats as needed
    ] = await Promise.all([
      Workout.countDocuments(),
      Workout.countDocuments({ isPublished: true }),
      Workout.countDocuments({ isFeatured: true }),
      User?.countDocuments() || 0, // Handle if User model doesn't exist yet
    ]);

    // Get recent activities (simplified for now)
    const recentWorkouts = await Workout.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title createdAt isPublished createdBy')
      .lean();

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalWorkouts,
        publishedWorkouts,
        featuredWorkouts,
        draftWorkouts: totalWorkouts - publishedWorkouts,
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.7), // Mock calculation
        newUsersThisMonth: Math.floor(totalUsers * 0.1), // Mock calculation
        totalWorkoutSessions: 0, // TODO: Implement when session tracking is ready
        totalWorkoutTime: 0, // TODO: Implement when session tracking is ready
        averageRating: 4.5, // TODO: Calculate from actual ratings
        topPerformingWorkouts: [], // TODO: Implement based on user engagement
        recentActivity: recentWorkouts.map(workout => ({
          id: workout._id,
          type: 'workout_created',
          title: `New workout: ${workout.title}`,
          description: `${workout.createdBy} created a new workout`,
          timestamp: workout.createdAt,
          workoutId: workout._id
        }))
      }
    });
  } catch (error: any) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while retrieving dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mount workout routes
router.use('/workouts', adminWorkoutRoutes);

// Mount other admin routes (placeholders for future implementation)
router.use('/users', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'User management endpoints not yet implemented'
  });
});

router.use('/analytics', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Analytics endpoints not yet implemented'
  });
});

router.use('/settings', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Settings endpoints not yet implemented'
  });
});

export default router;