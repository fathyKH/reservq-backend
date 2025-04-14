import mongoose , { Schema, Document } from "mongoose";

export interface IReservation extends Document {
    profileId: mongoose.Types.ObjectId;
    date: String;
    hour: String ;
    location: String;
    numberOfGuests: Number;
}

const ReservationSchema: Schema = new Schema<IReservation>({
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    date: { type: String, required: true },
    hour: { type: String, required: true },
    location: { type: String, required: true, choices: ["Indoor", "Outdoor"] },
    numberOfGuests: { type: Number, required: true },
}
, {
    toJSON: {
        transform: (_doc, ret) => {
            ret.id = ret._id.toString(); // Convert _id to id
            delete ret._id; // Remove _id
            delete ret.__v; // Remove __v (Mongoose version key)

            // Rename populated profileId to profile
            if (ret.profileId && typeof ret.profileId === 'object') {
                ret.profile = ret.profileId;
                delete ret.profileId;
            }
            return ret;

            
  
        },
    },
});

export default mongoose.model<IReservation>("Reservation", ReservationSchema);