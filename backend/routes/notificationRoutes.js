import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', protectRoute, getNotifications);

// Mark notification(s) as read
router.put('/:id/read', protectRoute, markAsRead);

export default router;
