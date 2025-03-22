import mongoose, { Document, Schema } from "mongoose";


interface Product extends Document {
    productId: mongoose.Types.ObjectId; 
    name: string;                       
    price: number;                      
    discount?: number;                  
    quantity: number; 
}
interface IOrder extends Document {
    userId: mongoose.Types.ObjectId ; // Reference to User
    products: Product[];
    total: number;
    date: Date;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    address: string;
    deliveryType: string;
}

const ProductSchema: Schema = new Schema<Product>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, required: true }
  },
    { _id: false }
);

const OrderSchema: Schema = new Schema<IOrder>(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
      products: { type: [ProductSchema], required: true }, // Embedded ProductSchema
      total: { type: Number, required: true },
      date: { type: Date, required: true },
      status: { type: String, default: "pending" },
      paymentMethod: { type: String, required: true },
      paymentStatus: { type: String, default: "pending" },
      address: { type: String, required: true },
      deliveryType: { type: String, enum: ["delivery", "pickup","in-restaurant"], required: true },
    },
    {
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

export default mongoose.model<IOrder>('Order', OrderSchema);