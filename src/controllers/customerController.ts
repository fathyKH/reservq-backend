import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Customer from "../models/customerModel";

export const getAllCustomers = async (req: AuthRequest, res: Response) => {
    //if (!req.user || req.user.role !== "admin") {
    //    res.status(401).json({ message: "You are not authorized to view this resource" });
    //    return
    //}

    try {
        const customers = await Customer.find().select('-userId');
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers" });
    }
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
    
    if (!req.user && req.user.role !== "admin") {
        res.status(401).json({ message: "You are not authorized to view this resource" });
        return
    }
    if (!req.params.id) {
        res.status(400).json({ message: "Customer ID is required" });
        return
    }
    try {
        const customer = await Customer.findById(req.params.id).select('-userId');
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer" });
    }
};