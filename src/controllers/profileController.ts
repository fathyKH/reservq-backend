import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Customer from "../models/customerModel";
export const getProfile = async (req: AuthRequest, res: Response) : Promise<void> => {
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

export const updateProfile = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "You are not authorized to update this resource" });
        return
    }
   
    try {
        const { firstName, lastName, phone, address, state, city } = req.body;

        // Explicitly define req.file as a Multer-S3 file (if it exists)
        const profileImage = req.file ? (req.file as Express.MulterS3.File).location : undefined;

        // Create an update object with only the fields that have values
        const updateData: Partial<{ firstName: string; lastName: string; phone: string; address: string; state: string; city: string; profileImage: string }> = {};

        if (firstName?.trim()) updateData.firstName = firstName;
        if (lastName?.trim()) updateData.lastName = lastName;
        if (phone?.trim()) updateData.phone = phone;
        if (address?.trim()) updateData.address = address;
        if (state?.trim()) updateData.state = state;
        if (city?.trim()) updateData.city = city;
        if (profileImage) updateData.profileImage = profileImage;

        // Ensure at least one valid field is being updated
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "No valid fields provided for update" });
            return
        }

        const updatedCustomer = await Customer.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            res.status(404).json({ message: "Customer not found" });
            return
        }

        res.status(200).json({ message: "Profile updated successfully", customer: updatedCustomer });
        return

    } catch (error) {
        res.status(500).json({ message: "Error updating your data" });
        return
    }
};