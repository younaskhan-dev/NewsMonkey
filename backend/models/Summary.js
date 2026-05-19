import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    articleUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    summaryBullets: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Summary', summarySchema);
