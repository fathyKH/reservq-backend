import { Request, Response } from "express";
import Product from "../models/productModel";
import { AuthRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: "Invalid product ID format" });
      return
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(401).json({ message: "You are not authorized to create a product" });
      return
    }
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({message:"Product created successfully"});
  } catch (error) {
    res.status(400).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(401).json({ message: "You are not authorized to update this product" });
      return
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (product) {
      res.status(200).json({message:"Product updated successfully"});
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    }
}

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(401).json({ message: "You are not authorized to delete this product" });
      return
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};