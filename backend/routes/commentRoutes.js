import express from 'express';
import { 
  addComment, 
  getComments, 
  deleteComment 
} from '../controllers/commentController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Public route to get comments for an article
router.get('/', getComments);

// Protected routes for adding and deleting comments
router.post('/', protectRoute, addComment);
router.delete('/:id', protectRoute, deleteComment);

export default router;
