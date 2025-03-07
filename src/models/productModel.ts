import mongoose, { Schema, Document } from 'mongoose';

interface IReview {
  user: string;
  userImage: string;
  rating: number;
  comment: string;
  time: string;
}

interface IMealContent {
  item: string;
  quantity: number;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  rating: number;
  size: string;
  addon: string;
  quantity: number;
  discount: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  ingredients: string[];
  meal_contents: IMealContent[];
  reviews: IReview[];
  videoUrl: string;
  status: "available" | "out of stock";
}

const ReviewSchema: Schema = new Schema<IReview>({
  user: { type: String, required: true },
  userImage: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  time: { type: String, required: true }
});

const MealContentSchema: Schema = new Schema<IMealContent>({
  item: { type: String, required: true },
  quantity: { type: Number, required: true }},
  {
    _id: false
  }

);

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    size: { type: String, required: true },
    addon: { type: String, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: { type: [String], required: true },
    ingredients: { type: [String], required: true },
    meal_contents: { type: [MealContentSchema], required: true },
    reviews: { type: [ReviewSchema], default: [] },
    videoUrl: { type: String, required: true },
    status: { type: String, default: "available" },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString(); // Convert _id to id
        delete ret._id; // Remove _id
        delete ret.__v; // Remove __v (Mongoose version key)

        // Ensure _id is removed from meal_contents
        if (ret.meal_contents && Array.isArray(ret.meal_contents)) {
          ret.meal_contents = ret.meal_contents.map(({ _id, ...content }) => content);
        }

        return ret;
      },
    },
  }
);

// Pre-save hook for new or modified products
ProductSchema.pre('save', function (next) {
  this.status = this.quantity === 0 ? 'out of stock' : 'available';
  next();
});

// Pre-update hook for updating status when quantity changes
ProductSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  
  // Handle cases where quantity is inside `$set`
  const quantity = update.quantity ?? update.$set?.quantity ?? update.$inc?.quantity;

  if (quantity !== undefined) {
    update.$set = update.$set || {};
    update.$set.status = quantity === 0 ? 'out of stock' : 'available';
  }

  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);
