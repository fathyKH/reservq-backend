import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Review from "../models/reviewModel";
import Product from "../models/productModel"
import mongoose from "mongoose";

export const createReview = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "You are not authorized to create a review" });
        return;
    }
    const { rating, comment, productId } = req.body;
    if (!rating || !comment || !productId) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    const product = await Product.findById(productId)
    if (!product){
        res.status(404).json({ message: "product not found" })
        return
    }
    const userId = req.user.id;
    try {
        const review = new Review({
            productId:productId,
            userId: userId,
            rating: rating,
            comment: comment,
        });
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error adding review" });
    }
};

export const getReviews = async (req: Request, res: Response) : Promise<void> => {
    try {
           
            const comments = await Review.aggregate([
                { $match: { productId: new mongoose.Types.ObjectId(req.params.id) } },
                {
                  $lookup: {
                    from: "users", // Ensure this matches your actual User collection name
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                  },
                },
                { $unwind: "$userDetails" }, // Flatten the array
                
                {
                  $lookup: {
                    from: "customers", // Ensure this matches your actual Customer collection name
                    localField: "userDetails._id", // Linking user with customer
                    foreignField: "userId", // Customer stores userId
                    as: "customerDetails",
                  },
                },
                { $unwind: "$customerDetails" }, // Flatten customer details
                
                {
                  $project: {
                    id: "$_id", // Rename _id to id
                    _id: 0,                  comment: 1,
                    blogId: 1,
                    date: 1,
                    "customerDetails.firstName": 1,
                    "customerDetails.lastName": 1,
                    "customerDetails.profileImage": 1,
                  },
                },
                { $sort: { date: -1 } }, // Sort by newest comments first
              ]);
              
            res.status(200).json(comments);
            return
        } catch (error) {
            res.status(500).json({ message: "Error fetching reviews" });
            return
        }
};

export const editReview = async (req : AuthRequest, res : Response) : Promise<void> => {
    if (!req.user){
        res.status(401).json({ message: "you are not authorized to edit a review"});
        return
    }

    const {comment} = req.body;
    if (!comment) {
        res.status(400).json({ message: "comment field is required"});
        return
    }
    console.log('in')
    try {
        const review = await Review.findById(req.params.id);
        if (!review){
            res.status(404).json({ message : "review not found" });
            return
        }

        if (!review.userId.equals(req.user.id)){
            res.status(401).json({message: "you are not authorized to edit this review"});
            return
        }

        review.comment = comment;
        await review.save();
        return
    } catch(error){
        res.status(500).json({ message : "error fetching review" })
        return
    }

};

export const deleteReview = async (req: AuthRequest, res: Response) : Promise<void> => {
    if (!req.user){
        res.status(401).json({ message: "you are not authorized to delete a review"});
        return
    }

    try {
        const review = await Review.findById(req.params.id);
        if (!review){
            res.status(404).json({ message : "review not found" });
            return
        }

        if (!review.userId.equals(req.user.id)){
            res.status(401).json({message: "you are not authorized to delete this review"});
            return
        }

        await review.deleteOne();
        return
    } catch(error){
        res.status(500).json({ message : "error deleting review" })
        return
    }
}