import mongoose, { Schema, Document } from 'mongoose';

interface ICustomer extends Document {
    userId: mongoose.Types.ObjectId;
    profileImage: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    address: string;
    orders:number;
    TotalSpent:number;
}

const CustomerSchema = new mongoose.Schema<ICustomer>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    address: {
        type: String,
    },
    orders: {
        type: Number,
        default: 0
    },
    TotalSpent: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, 
    toJSON: {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString(); // Convert _id to id
    delete ret._id; // Remove _id
    delete ret.__v; // Remove __v (Mongoose version key)
    return ret;
        }
    }
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);