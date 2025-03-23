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
        console.log(req.user)
        if (req.user) {
            if (req.user.role === "admin") {
            const blogs = await blogSchema.find();
            res.status(200).json(blogs);
            return
            }
        }
        else {
            const blogs = await blogSchema.find().select({ content: 0 });
            res.status(200).json(blogs);
        }
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
        const { title, content, excerpt, category, readTime} = req.body;
        
        const image = req.file ? (req.file as Express.MulterS3.File).location : undefined;
        if (!title || !content || !excerpt || !category || !image|| !readTime) {
            res.status(400).json({ message: "All fields are required" });
            return
        }
        const createdData = { title, content, excerpt, category, image, readTime };
        const blog = new blogSchema(createdData);
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
        const { title, content, excerpt, category } = req.body;
        const image = req.file ? (req.file as Express.MulterS3.File).location : undefined;
        const updatedData: Partial<{ title: string; content: string; excerpt: string; category: string, image: string }> = {};

        if (title) updatedData.title = title;
        if (content) updatedData.content = content;
        if (excerpt) updatedData.excerpt = excerpt;
        if (category) updatedData.category = category;
        if (image) updatedData.image = image;

        if (Object.keys(updatedData).length === 0) {
            res.status(400).json({ message: "At least one field is required to update the blog" });
            return;
        }
        const blog = await blogSchema.findByIdAndUpdate(req.params.id, updatedData, { new: true });
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