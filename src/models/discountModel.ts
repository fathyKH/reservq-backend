import mongoose, { Document, Schema } from "mongoose";

interface IDiscount extends Document {
    discountCode: string;
    discountPercentage: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
}

const DiscountSchema: Schema = new Schema<IDiscount>({
    discountCode: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model<IDiscount>('Discount', DiscountSchema);