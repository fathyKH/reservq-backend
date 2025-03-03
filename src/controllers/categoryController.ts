import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Category from "../models/categoryModel";
import Product from "../models/productModel";

export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "error getting category" });
    }
}
export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "error getting categories" });
    }
};
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to create a category" });
            return 
        }
        const category = new Category(req.body);
        await category.save();
        res.status(201).json({message:"Category created successfully"});
    } catch (error) {
        res.status(400).json({ message: "Error creating category" });
    }
}

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to update this category" });
            return 
        }
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (category) {
            res.status(200).json({message:"Category updated successfully"});
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error updating category" });
    }
}

export const deleteOrDeactivateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
  
      // Count products that reference this category
      const productCount = await Product.countDocuments({ categories: id });
      
      if (productCount > 0) {
        // If category is in use, mark it as inactive
        category.isActive = false;
        await category.save();
        res.status(200).json({ message: "Category is in use and has been deactivated." });
      } else {
        // If not in use, delete the category
        await Category.deleteOne({ _id: id });
        res.status(200).json({ message: "Category deleted successfully." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error processing category deletion" });
    }
  };
  