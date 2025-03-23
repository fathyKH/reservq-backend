import mongoose, { Schema, Document } from "mongoose";

interface IComment extends Document {
    comment: string;
    userId: mongoose.Types.ObjectId;
    blogId: mongoose.Types.ObjectId;
    reply: mongoose.Types.ObjectId[];
    date: Date;
}

const CommentSchema = new Schema<IComment>({
    comment: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true , index: true},
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    date: { type: Date, default: Date.now },
});

export default mongoose.model<IComment>("Comment", CommentSchema);