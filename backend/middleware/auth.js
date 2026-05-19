import { requireAuth } from '@clerk/express';
import User from '../models/User.js';

// Middleware to protect routes using Clerk Express SDK
export const protectRoute = (req, res, next) => {
  requireAuth()(req, res, (err) => {
    if (err) {
      console.error('[Auth Error]:', err.message || err);
      return res.status(err.status || 401).json({ message: err.message || "Unauthorized" });
    }
    next();
  });
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerkId = authObj?.userId || req.body?.clerkId || req.query?.clerkId;
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized - No Clerk ID found" });
    }

    const user = await User.findOne({ clerkId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Admin Error]:', error);
    res.status(500).json({ message: "Server error verifying admin status", error: error.message });
  }
};
