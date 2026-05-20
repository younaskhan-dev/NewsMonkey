import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Clerk Middleware with explicit publishableKey and secretKey options
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Clean API Logging Middleware
app.use((req, res, next) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const user = authObj?.userId || req.query?.clerkId || req.body?.clerkId || 'public';
    // Filter out repetitive notification polling to keep terminal clean
    if (!req.originalUrl.includes('/notifications')) {
      console.log(`[API] ${req.method} ${req.originalUrl.split('?')[0]} (${user})`);
    }
  } catch (err) {
    console.error(`[API Log Error]:`, err.message);
  }
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/summaries', summaryRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('NewsMonkey Backend API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
