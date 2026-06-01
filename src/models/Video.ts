import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    instagramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    taggedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    price: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
