import { Request, Response } from "express";
import blogSchema from "../models/blogModel";
import { AuthRequest } from "../middlewares/authMiddleware";


export const getBlogById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const blog = await blogSchema.findById(req.params.id);
        if (blog) {
            res.status(200).json(blog);
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error getting blog" });  
    }
};

export const getAllBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const blogs = await blogSchema.find().select({ content: 0 });;
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "error getting blogs" });
    }
};

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to create a blog" });
            return 
        }
        const blog = new blogSchema(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: "Error creating blog" });
    }
};

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to update this blog" });
            return 
        }
        const blog = await blogSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (blog) {
            res.status(200).json(blog);
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error updating blog" });
    }
}

export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to delete this blog" });
            return 
        }
        const blog = await blogSchema.findByIdAndDelete(req.params.id);
        if (blog) {
            res.status(200).json({ message: "Blog deleted successfully" });
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error deleting blog" });
    }
};