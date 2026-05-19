import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk ID
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
    },
    articleUrl: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
