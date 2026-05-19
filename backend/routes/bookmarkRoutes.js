import express from 'express';
import { 
  addBookmark, 
  getBookmarks, 
  deleteBookmark, 
  checkBookmark 
} from '../controllers/bookmarkController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Protected Bookmark Routes
router.post('/', protectRoute, addBookmark);
router.get('/', protectRoute, getBookmarks);
router.delete('/:id', protectRoute, deleteBookmark);
router.get('/check', protectRoute, checkBookmark);

export default router;
