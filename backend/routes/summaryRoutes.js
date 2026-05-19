import express from 'express';
import { getArticleSummary } from '../controllers/summaryController.js';

const router = express.Router();

// Generate or fetch cached summary
router.post('/', getArticleSummary);

export default router;
