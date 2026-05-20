import express from 'express';
import { getTopHeadlines, searchNews } from '../controllers/newsController.js';

const router = express.Router();

// GET /api/news/top-headlines?category=general&country=us&max=9&page=1
router.get('/top-headlines', getTopHeadlines);

// GET /api/news/search?q=keyword&country=us&max=9&page=1&from=...
router.get('/search', searchNews);

export default router;
