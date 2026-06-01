import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    sections: { type: Array, default: [] }, // Stores JSON array of section configs
    customCss: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
