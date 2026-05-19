import Bookmark from '../models/Bookmark.js';

// Add a bookmark
export const addBookmark = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.body?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });
    const { title, description, image, url, publishedAt, source, category } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const newBookmark = await Bookmark.create({
      userId,
      title,
      description,
      image,
      url,
      publishedAt,
      source,
      category,
    });

    res.status(201).json(newBookmark);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Article is already bookmarked" });
    }
    res.status(500).json({ message: "Error adding bookmark", error: error.message });
  }
};

// Get all bookmarks for user
export const getBookmarks = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });
    const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookmarks", error: error.message });
  }
};

// Delete a bookmark
export const deleteBookmark = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });
    const { id } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ _id: id, userId });
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.status(200).json({ message: "Bookmark removed successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bookmark", error: error.message });
  }
};

// Check if URL is bookmarked
export const checkBookmark = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: "URL parameter is required" });
    }

    const bookmark = await Bookmark.findOne({ userId, url });
    res.status(200).json({ isBookmarked: !!bookmark, bookmarkId: bookmark?._id });
  } catch (error) {
    console.error('[checkBookmark Error]:', error);
    res.status(500).json({ message: "Error checking bookmark", error: error.message });
  }
};
