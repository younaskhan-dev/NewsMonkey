import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';

// Add a comment
export const addComment = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.body?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });
    const { articleUrl, text, userName, userImage } = req.body;

    if (!articleUrl || !text) {
      return res.status(400).json({ message: "Article URL and comment text are required" });
    }

    const newComment = await Comment.create({
      userId,
      userName: userName || 'Anonymous',
      userImage,
      articleUrl,
      text,
    });

    // Notify users who bookmarked this article about the new comment!
    try {
      const bookmarks = await Bookmark.find({ url: articleUrl });
      for (const b of bookmarks) {
        if (b.userId !== userId) {
          await Notification.create({
            userId: b.userId,
            type: 'comment',
            message: `${userName || 'Someone'} commented on an article you saved: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"`,
            articleUrl,
          });
        }
      }
    } catch (notifErr) {
      console.error("[Notification Error in addComment]:", notifErr);
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// Get comments for an article
export const getComments = async (req, res) => {
  try {
    const { articleUrl } = req.query;

    if (!articleUrl) {
      return res.status(400).json({ message: "Article URL is required" });
    }

    const comments = await Comment.find({ articleUrl }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user owns comment or is admin
    const user = await User.findOne({ clerkId: userId });
    if (comment.userId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden - You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};
