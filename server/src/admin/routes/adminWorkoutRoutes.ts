// server/src/admin/routes/adminWorkoutRoutes.ts
import express from 'express';
import { adminAuth } from '../middleware/adminAuth';
import {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  bulkDeleteWorkouts,
  bulkUpdateWorkouts,
  togglePublishWorkout,
  toggleFeatureWorkout,
  duplicateWorkout,
  getWorkoutAnalytics,
  getWorkoutStats,
  getWorkoutFilterOptions,
  searchWorkouts,
  exportWorkouts,
  importWorkouts
} from '../controllers/adminWorkoutController';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Workout CRUD routes
router.get('/', getAllWorkouts);                    // GET /api/admin/workouts
router.get('/stats', getWorkoutStats);              // GET /api/admin/workouts/stats
router.get('/filter-options', getWorkoutFilterOptions); // GET /api/admin/workouts/filter-options
router.get('/search', searchWorkouts);              // GET /api/admin/workouts/search
router.get('/export', exportWorkouts);              // GET /api/admin/workouts/export
router.post('/import', importWorkouts);             // POST /api/admin/workouts/import
router.post('/bulk-delete', bulkDeleteWorkouts);    // POST /api/admin/workouts/bulk-delete
router.put('/bulk-update', bulkUpdateWorkouts);     // PUT /api/admin/workouts/bulk-update

router.get('/:id', getWorkoutById);                 // GET /api/admin/workouts/:id
router.post('/', createWorkout);                    // POST /api/admin/workouts
router.put('/:id', updateWorkout);                  // PUT /api/admin/workouts/:id
router.delete('/:id', deleteWorkout);               // DELETE /api/admin/workouts/:id

// Workout action routes
router.patch('/:id/toggle-publish', togglePublishWorkout);  // PATCH /api/admin/workouts/:id/toggle-publish
router.patch('/:id/toggle-feature', toggleFeatureWorkout);  // PATCH /api/admin/workouts/:id/toggle-feature
router.post('/:id/duplicate', duplicateWorkout);            // POST /api/admin/workouts/:id/duplicate
router.get('/:id/analytics', getWorkoutAnalytics);          // GET /api/admin/workouts/:id/analytics

export default router;



                                     


