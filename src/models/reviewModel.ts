import mongoose , { Schema, Document } from "mongoose";

interface IReview extends Document {
    productId:mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
}

const ReviewSchema: Schema = new Schema<IReview>({
    productId:{type: mongoose.Schema.Types.ObjectId, ref:'Product',required:true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
    },
    {
        toJSON:{
            transform: (_doc, ret) => {
                ret.id = ret._id.toString(); // Convert _id to id
                delete ret._id; // Remove _id
                delete ret.__v; // Remove __v (Mongoose version key)
                return ret;
            }
        }
    }
    );

export default mongoose.model<IReview>('Review', ReviewSchema);