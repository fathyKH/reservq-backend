import { Response } from "express";
import { AuthRequest } from "src/middlewares/authMiddleware";
import Comment from "../models/commentModel";


export const createComment = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "you are unauthorized to create a comment" });
        return
    }
    const { comment, blogId , reply } = req.body;
    const userId = req.user?.id;

    if (!comment || !blogId || !userId) {
        res.status(400).json({ message: "Missing required fields" });
        return
    }

    try {
        const newComment = await Comment.create({
            comment,
            userId: userId,
            blogId,
            reply: Array.isArray(reply) ? reply : [] // Handle reply here

        });
        res.status(201).json(newComment);
        return
    } catch (error) {
        res.status(500).json({ message: "Error creating comment" });
        return
    }
}

export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const comments = await Comment.find({ blogId: req.params.id });
        res.status(200).json(comments);
        return
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" });
        return
    }
}

export const editComment = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "you are unauthorized to edit a comment" });
        return
    }
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return
        }
        if (!comment.userId.equals(req.user.id)) {
            res.status(403).json({ message: "You are not authorized to edit this comment" });
            return
        }
        comment.comment = req.body.comment;
        await comment.save();
        res.status(200).json(comment);
        return
    } catch (error) {
        res.status(500).json({ message: "Error editing comment" });
        return
    }
}

export const deleteComment = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "you are unauthorized to delete a comment" });
        return
    }
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return
        }
        if (!comment.userId.equals(req.user.id)) {
            res.status(403).json({ message: "You are not authorized to delete this comment" });
            return
        }
        await comment.deleteOne();
        res.status(200).json({ message: "Comment deleted successfully" });
        return
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment" });
        return
    }
}
