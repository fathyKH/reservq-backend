import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Customer from "../models/customerModel";

export const getProfile = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "You are not authorized to view this resource" });
        return
    }
    try {
        const customer = await Customer.findOne({userId:req.user.id}).select('-userId');
        if (!customer) {
            res.status(404).json({ message: "Error fetching your data" });
            return;
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your data" });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "You are not authorized to update this resource" });
        return
    }
    try {
        const customer = await Customer.findOneAndUpdate({userId:req.user.id}, req.body, { new: true });
        if (!customer) {
            res.status(404).json({ message: "Error updating your data" });
            return;
        }
        res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating your data" });
    }
};