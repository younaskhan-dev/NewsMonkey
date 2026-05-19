import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';

// Toggle Like status for an article
export const toggleLike = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.body?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });

    const { articleUrl, title } = req.body;
    if (!articleUrl || !title) {
      return res.status(400).json({ message: "Article URL and title are required" });
    }

    const existingLike = await Like.findOne({ userId, articleUrl });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      const totalLikes = await Like.countDocuments({ articleUrl });
      return res.status(200).json({ isLiked: false, totalLikes });
    } else {
      await Like.create({ userId, articleUrl, title });
      const totalLikes = await Like.countDocuments({ articleUrl });

      // Find users who bookmarked this article to notify them of engagement!
      const bookmarks = await Bookmark.find({ url: articleUrl });
      for (const b of bookmarks) {
        if (b.userId !== userId) {
          await Notification.create({
            userId: b.userId,
            type: 'like',
            message: `Someone liked an article you saved: "${title.length > 40 ? title.substring(0, 40) + '...' : title}"`,
            articleUrl,
          });
        }
      }

      return res.status(200).json({ isLiked: true, totalLikes });
    }
  } catch (error) {
    console.error('[toggleLike Error]:', error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};

// Get like stats for an article
export const getArticleLikes = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    const { articleUrl } = req.query;

    if (!articleUrl) {
      return res.status(400).json({ message: "Article URL is required" });
    }

    const totalLikes = await Like.countDocuments({ articleUrl });
    let isLiked = false;

    if (userId) {
      const userLike = await Like.findOne({ userId, articleUrl });
      isLiked = !!userLike;
    }

    res.status(200).json({ totalLikes, isLiked });
  } catch (error) {
    console.error('[getArticleLikes Error]:', error);
    res.status(500).json({ message: "Error fetching likes", error: error.message });
  }
};
