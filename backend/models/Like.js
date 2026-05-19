import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    articleUrl: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only like a specific article once
likeSchema.index({ userId: 1, articleUrl: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);
