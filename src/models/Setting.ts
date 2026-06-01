import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // e.g., 'global_theme', 'hero_section'
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can store JSON objects with colors, images, text, etc.
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
