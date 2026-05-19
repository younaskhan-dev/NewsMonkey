import express from 'express';
import { 
  syncUser, 
  getUserProfile, 
  updatePreferences, 
  getAdminStats, 
  getAllUsers, 
  updateUserRole 
} from '../controllers/userController.js';
import { protectRoute, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected User Routes
router.post('/sync', protectRoute, syncUser);
router.get('/profile', protectRoute, getUserProfile);
router.put('/preferences', protectRoute, updatePreferences);

// Protected Admin Routes
router.get('/admin/stats', protectRoute, requireAdmin, getAdminStats);
router.get('/admin/users', protectRoute, requireAdmin, getAllUsers);
router.put('/admin/users/:id/role', protectRoute, requireAdmin, updateUserRole);

export default router;
