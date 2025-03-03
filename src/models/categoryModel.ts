import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<ICategory>('Category', CategorySchema);
