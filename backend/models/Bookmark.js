import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk ID
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
    },
    source: {
      type: String,
    },
    category: {
      type: String,
      default: 'general',
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks for the same user and URL
bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
