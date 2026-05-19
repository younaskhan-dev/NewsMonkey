import Notification from '../models/Notification.js';

// Get all notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.query?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('[getNotifications Error]:', error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// Mark a notification as read (or all if id === 'all')
export const markAsRead = async (req, res) => {
  try {
    const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authObj?.userId || req.body?.clerkId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user ID found" });

    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return res.status(200).json({ message: "All notifications marked as read" });
    } else {
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      return res.status(200).json(notification);
    }
  } catch (error) {
    console.error('[markAsRead Error]:', error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};
