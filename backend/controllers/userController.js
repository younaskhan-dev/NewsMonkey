import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';

// Sync Clerk user with MongoDB
export const syncUser = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerkId = authObj?.userId || req.body?.clerkId;
    const { name, email } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: "Missing required user data", received: { clerkId, name, email } });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Check if user exists by email (to prevent E11000 duplicate key error if clerkId changed)
      let existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        existingUserByEmail.clerkId = clerkId;
        if (name) existingUserByEmail.name = name;
        await existingUserByEmail.save();
        user = existingUserByEmail;
      } else {
        user = await User.create({
          clerkId,
          name: name || 'User',
          email,
          preferences: ['general', 'technology', 'business'],
        });
      }
    } else if (name && user.name !== name) {
      user.name = name;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('[syncUser Error]:', error);
    res.status(500).json({ message: "Error syncing user profile", error: error.message });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerkId = authObj?.userId || req.query?.clerkId;
    if (!clerkId) return res.status(401).json({ message: "Unauthorized - No clerkId found" });
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerkId = authObj?.userId || req.body?.clerkId;
    if (!clerkId) return res.status(401).json({ message: "Unauthorized - No clerkId found" });
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: "Preferences must be an array" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      { preferences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating preferences", error: error.message });
  }
};

// ADMIN: Get Dashboard Stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookmarks = await Bookmark.countDocuments();
    const totalComments = await Comment.countDocuments();

    res.status(200).json({
      totalUsers,
      totalBookmarks,
      totalComments,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin stats", error: error.message });
  }
};

// ADMIN: Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// ADMIN: Update User Role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};
