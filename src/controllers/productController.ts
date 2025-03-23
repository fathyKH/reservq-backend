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
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(401).json({ message: "You are not authorized to create a product" });
      return;
    }

    // Destructure fields from request body
    const { name, price, quantity, category, size, addon, discount, videoUrl } = req.body;
    console.log('before')
    // Parse ingredients & meal_contents (in case they are sent as JSON strings)
    const ingredients = typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients;
    const meal_contents = typeof req.body.meal_contents === "string" ? JSON.parse(req.body.meal_contents) : req.body.meal_contents;
    console.log('after')
    // Process uploaded images from S3 (multer-s3)
    const images = req.files
      ? Array.isArray(req.files)
        ? req.files.map((file: Express.MulterS3.File) => file.location)
        : Object.values(req.files).flat().map((file: Express.MulterS3.File) => file.location)
      : [];
      console.log(name,price,quantity,category,size,addon,discount,ingredients,meal_contents,videoUrl)
      console.log(images)

    // Validate required fields
    if (!name || !price || !quantity || !category || !size || !addon || !ingredients || !meal_contents || !videoUrl || images.length === 0) {
      res.status(400).json({ message: "All fields are required, including at least one image" });
      return;
    }
    // Create new product
    const product = new Product({
      name,
      price,
      quantity,
      category,
      size,
      addon,
      discount,
      ingredients,
      meal_contents,
      videoUrl,
      images,
    });

    // Save to DB
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(401).json({ message: "You are not authorized to update this product" });
      return
    }
    const {name,price,quantity,category,size,addon,discount,ingredients,meal_contents,videoUrl} = req.body;
    const images = req.files ? 
      Array.isArray(req.files) ? 
      req.files.map((file: Express.MulterS3.File) => file.location) : 
      Object.values(req.files).map((files: Express.MulterS3.File[]) => files.map((file: Express.MulterS3.File) => file.location)) 
    : undefined;

    const updatedData : Partial<{name: string;price: number;quantity: number;category: string;size: string;addon: string;discount: number;ingredients: string;meal_contents: string;videoUrl: string;images: string[]}> = {};

    if (name) updatedData.name = name;
    if (price) updatedData.price = price;
    if (quantity) updatedData.quantity = quantity;
    if (category) updatedData.category = category;
    if (size) updatedData.size = size;
    if (addon) updatedData.addon = addon;
    if (discount) updatedData.discount = discount;
    if (ingredients) updatedData.ingredients = ingredients;
    if (meal_contents) updatedData.meal_contents = meal_contents;
    if (videoUrl) updatedData.videoUrl = videoUrl;
    if (images) {
      updatedData.images = images.map(image => Array.isArray(image) ? image : [image]).flat();
    }

    if (Object.keys(updatedData).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (product) {
      res.status(200).json(product);
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