import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString(); // Convert _id to id
        delete ret._id; // Remove _id
        delete ret.__v; // Remove __v (Mongoose version key)
        return ret;
      },
    },
  }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
