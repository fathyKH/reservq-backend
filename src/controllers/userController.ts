import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest, CustomJwtPayload } from "../middlewares/authMiddleware";
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user) {
            res.status(401).json({ message: "You are already logged in" });
            return
        }
        const existingUser=await User.findOne({email:req.body.email})
        if(existingUser){
            res.status(400).json({message:"User already exists"})
            return 
        }
        const {firstName, lastName, email, password} = req.body ;
        console.log(password);
        const hash = await bcrypt.hash(password, 10);
        const user = new User({firstName, lastName, email, password:hash});
        await user.save();
        res.status(201).json('user created successfully');
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error creating user" });
    }
}

export const loginUser = async (req : AuthRequest, res : Response) : Promise<void> => {
    try {
        if (req.user) {
            res.status(401).json({ message: "You are already logged in" });
            return
        }
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            throw new Error('User not found');
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        const jwtSecret = process.env.JWT_SECRET_KEY as string;
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.isAdmin ? "admin" : "user" },
            jwtSecret,
            { expiresIn: '24h' });
        res.status(200).json({token: token, role: user.isAdmin ? "admin" : "user"});
 
        
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const resetPassword = async (req : AuthRequest, res : Response) : Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "you aren't authorized" });
            return
        }
        const { password } = req.body;
        if (!password) {
            res.status(400).json({ message: "Password is required" });
            return
        }
        const hash = bcrypt.hash(password, 10);
        await User.updateOne({ _id: req.user.id }, { $set: { password: hash } });
        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
        
    }
}