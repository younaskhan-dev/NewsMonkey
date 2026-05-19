import express from 'express';
import { toggleLike, getArticleLikes } from '../controllers/likeController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Get like stats for an article (public/optional auth)
router.get('/', getArticleLikes);

// Toggle like (protected)
router.post('/toggle', protectRoute, toggleLike);

export default router;
