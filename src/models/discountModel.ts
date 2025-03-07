import mongoose, { Document, Schema } from "mongoose";

interface IDiscount extends Document {
    discountCode: string;
    discountPercentage: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
}

const DiscountSchema: Schema = new Schema<IDiscount>(
    {
      discountCode: { type: String, required: true },
      discountPercentage: { type: Number, required: true },
      validFrom: { type: Date, required: true },
      validTo: { type: Date, required: true },
      isActive: { type: Boolean, default: true },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt
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

export default mongoose.model<IDiscount>('Discount', DiscountSchema);