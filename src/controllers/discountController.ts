import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Discount from "../models/discountModel";


export const checkDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const discount = await Discount.findOne({ discountCode: req.body.discountCode , isActive: true });
        const currentDate = new Date();
        if (discount && discount.validFrom <= currentDate && discount.validTo >= currentDate) {
            res.status(200).json(discount);
        } else {
            res.status(404).json({ message: "Discount not valid or expired" });
        }
    } catch (error) {
        res.status(500).json({ message: "error in checking discount" });
    }
};

export const getAllDiscounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

        if (!req.user || req.user.role !== "admin" ) {
            res.status(401).json({ message: "You are not authorized to view this discount" });
            return;
        }

        const discounts = await Discount.find();
        res.status(200).json(discounts);
    } catch (error) {
        res.status(500).json({ message: "error in getting discounts" });
    }
};
export const getDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const discount = await Discount.findById(req.params.id);

        if (!discount) {
            res.status(404).json({ message: "Discount not found" });
            return;
        }

        if (!req.user || req.user.role !== "admin" ) {
            res.status(401).json({ message: "You are not authorized to view this discount" });
            return;
        }

        res.status(200).json(discount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error in getting discount" });
    }
};

export const createDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin" ) {
            res.status(401).json({ message: "You are not authorized to create a discount" });
            return;
        }
        const { validFrom, validTo } = req.body;
        if (validFrom >= validTo) {
            res.status(400).json({ message: "Valid from date must be before valid to date" });
            return;
          }
        const discount = await Discount.create(req.body);
        res.status(201).json({message:"Discount created successfully"});
    } catch (error) {
        res.status(500).json({ message: "error in creating discount" });
    }
};

export const updateDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        interface RequestBody {
            discountCode?: string;
            isActive?: boolean;
            validFrom?: Date;
            validTo?: Date;
          }
          
          const updateData: RequestBody = {};
          if (req.body.discountCode) updateData.discountCode = req.body.discountCode;
          if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
          if (req.body.validFrom) updateData.validFrom = req.body.validFrom;
          if (req.body.validTo) updateData.validTo = req.body.validTo;
        if (updateData.validFrom && updateData.validTo && updateData.validFrom >= updateData.validTo) {
          res.status(400).json({ message: "Valid from date must be before valid to date" });
          return;
        }
        
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (discount) {
            res.status(200).json({message:"Discount updated successfully"});
        } else {
            res.status(404).json({ message: "Discount not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error in updating discount" });
    }
};

export const deleteDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin" ) {
            res.status(401).json({ message: "You are not authorized to delete this discount" });
            return;
        }
        const discount = await Discount.findByIdAndDelete(req.params.id);
        if (discount) {
            res.status(200).json({message:"Discount deleted successfully"});
        } else {
            res.status(404).json({ message: "Discount not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error in deleting discount" });
    }
};