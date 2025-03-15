import { Request, Response } from "express";
import User from "../models/authModel";
import Customer from "../models/customerModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "../config/sendgrid";
import { MailDataRequired } from "@sendgrid/mail";
import { AuthRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (req.user) {
            res.status(401).json({ message: "You are already logged in" });
            return
        }

        const {firstName, lastName, email, password} = req.body ;
        if(!firstName || !lastName || !email || !password){
            res.status(400).json({message:"All fields are required"})
            return
        }

        const existingUser=await User.findOne({email:req.body.email})
        if(existingUser){
            res.status(400).json({message:"User already exists"})
            return 
        }
        // create user record 
        const hash = await bcrypt.hash(password, 10);
        const user = new User({firstName, lastName, email, password:hash});
        await user.save({session});

        // create customer record
        const customer = new Customer({userId:user._id, firstName:user.firstName, lastName:user.lastName, email:user.email});
        await customer.save({session});
        
        //commit transaction
        await session.commitTransaction();
        
        res.status(201).json('user created successfully');
    } catch (error) {
        //rollback transaction
        await session.abortTransaction();
        session.endSession();
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
            res.status(404).json({ message: "Invalid email or password" });
            return
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            res.status(404).json({ message: "Invalid email or password" });
            return
        }
        const jwtSecret = process.env.JWT_SECRET_KEY as string;
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.isAdmin ? "admin" : "user" },
            jwtSecret,
            { expiresIn: '24h' });
        res.status(200).json({token: token, role: user.isAdmin ? "admin" : "user"});
 
        
    } catch (error) {
        res.status(500).json({ message: "unable to login" });
    }
}

export const changePassword = async (req : AuthRequest, res : Response) : Promise<void> => {
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
        const hash = (await bcrypt.hash(password, 10)).toString();
        await User.updateOne({ _id: req.user.id }, { $set: { password: hash } });
        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "unable to update password" });
        
    }
}

export const forgetPassword = async (req : AuthRequest, res : Response) : Promise<void> => {
    try {
        if (req.user) {
            res.status(401).json({ message: "you already logged in" });
            return
        }
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return
        }
        const user = await User.findOne({ email });
        if (user) {
            const jwtSecret = process.env.PASSWORD_RESET_SECRET as string;
            const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
            const link = `${process.env.DOMAIN}/reset-password?token=${token}`;
            // send email to user
            const msg: MailDataRequired = {
                to: email,
                from: process.env.SENDGRID_EMAIL as string,
                templateId: process.env.PASSWORD_RESET_TEMPLATE_ID as string,
                dynamic_template_data: {
                  reset_url: link,
                },
              } as MailDataRequired; // Type assertion to avoid TypeScript error
            await sgMail.send(msg);            

        }
        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "unable to send password reset link" });
    }

}

export const verifyResetToken = (req: AuthRequest, res: Response) : Promise<void> => {
    if (req.user) {
        res.status(401).json({ message: "you already logged in" });
        return
    }
    const { token } = req.body;
  
    if (!token) {
       res.status(400).json({ valid: false, message: "Token is missing" });
       return
    }
  
    try {
        const decoded = jwt.verify(token as string, process.env.PASSWORD_RESET_SECRET as string);
        res.json({ valid: true });
        return
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({ message: "Invalid or expired token" });
            return
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({ message: "Invalid or expired token" });
            return
        }
        else {
            res.status(400).json({ message: "Invalid or expired token" });
            console.log(error.message);
            return
        }
    }
  };

  export const resetPassword = async (req: AuthRequest, res: Response) : Promise<void> => {
    
    if (req.user) {
        res.status(401).json({ message: "you already logged in" });
        return
    }
    
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return
    }
  
    try {
      const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET as string);
      const userID = (decoded as any).id; // Extract email from token
      const user = await User.findById( userID );
      if (!user){  
            res.status(404).json({ message: "User not found" });
            return
    }
      user.password = await bcrypt.hash(password, 10);
      await user.save();
  
      res.json({ message: "Password updated successfully!" });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({ message: "Invalid or expired token" });
            return
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({ message: "Invalid or expired token" });
            return
        }
        else {
            res.status(400).json({ message: "Invalid or expired token" });
            console.log(error.message);
            return
        }
    }
  };
  