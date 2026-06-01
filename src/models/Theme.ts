import mongoose, { Schema, Document } from 'mongoose';

export interface ITheme extends Document {
  name: string;
  settings: Record<string, any>;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    settings: { type: Object, default: {} },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Theme || mongoose.model<ITheme>('Theme', ThemeSchema);
