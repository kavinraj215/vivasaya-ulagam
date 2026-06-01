import mongoose, { Schema, Document } from 'mongoose';

export interface IThemeSection extends Document {
  themeId: mongoose.Types.ObjectId;
  type: string;
  position: number;
  settings: Record<string, any>;
  isVisible: boolean;
}

const ThemeSectionSchema: Schema = new Schema(
  {
    themeId: { type: Schema.Types.ObjectId, ref: 'Theme', required: true },
    type: { type: String, required: true },
    position: { type: Number, required: true, default: 0 },
    settings: { type: Object, default: {} },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ThemeSection || mongoose.model<IThemeSection>('ThemeSection', ThemeSectionSchema);
