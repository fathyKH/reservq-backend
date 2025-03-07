import mongoose, { Schema, Document } from "mongoose";

interface IBlog extends Document {
    title: string;
    excerpt: string;
    content: string;
    image: string;
    readTime: string;
    category: string;
}

const BlogSchema: Schema = new Schema<IBlog>(
    {
      title: { type: String, required: true },
      excerpt: { type: String, required: true },
      image: { type: String, required: true },
      content: { type: String, required: true },
      readTime: { type: String, required: true },
      category: { type: String, required: true },
    },
    {
      timestamps: true,
      toJSON: {
        transform: (_doc, ret) => {
          ret.id = ret._id.toString(); // Convert _id to id
          delete ret._id; // Remove _id
          delete ret.__v; // Remove __v (version key)
          return ret;
        },
      },
    }
  );

export default mongoose.model<IBlog>('Blog', BlogSchema);