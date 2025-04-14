import { AuthRequest } from "src/middlewares/authMiddleware";
import { Request, Response } from "express";
import Reservation from "../models/reservationModel";
import Customer from "../models/customerModel";

export const createReservation = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: "you are not authorized to create a reservation" });
        return;
    }
    const { date, hour, location, numberOfGuests } = req.body;
    if (!date || !hour || !location || !numberOfGuests) {
            res.status(400).json({ error: "All fields are required" });
            return;
    }
    if (location !== "Indoor" && location !== "Outdoor") {
        res.status(400).json({ error: "Invalid location" });
    }
    if (date < new Date().toISOString().split('T')[0]) {
        res.status(400).json({ error: "Date must be in the future" });
        return
    }

    try {
        const profileId = await Customer.findOne({userId:req.user.id},{id:1} );
        if (!profileId) {
            res.status(404).json({ error: "User not found or not a Customer" });
            return;
        }
        const reservation = new Reservation({ profileId:profileId, date:date, hour:hour, location:location, numberOfGuests:numberOfGuests });
        await reservation.save();
        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: "Failed to create reservation" });
    }
};

export const getReservation = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(401).json({ error: "you are not authorized to view a reservation" });
        return;
    }
    try {
        const reservation = await Reservation.findById(req.params.id).populate("profileId","firstName lastName email phone");
        if (!reservation) {
            res.status(404).json({ error: "Reservation not found" });
            return;
        }
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ error: "Failed to get reservation" });
    }
}
export const getAllReservations = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(401).json({ error: "you are not authorized to view all reservations" });
        return;
    }
    try {
        const reservations = await Reservation.find().populate("profileId","firstName lastName email phone");
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Failed to get reservations" });
    }
};

export const getAllUserReservations = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: "you are not authorized to view your reservations" });
        return;
    }
    try {

        const profileId = await Customer.findOne({userId:req.user.id},{id:1} );
        const reservations = await Reservation.find({ profileId:profileId }).populate("profileId","firstName lastName email phone");
        res.status(200).json(reservations);
        return
    } catch (error) {
        res.status(500).json({ message: "Failed to get reservations" });
        return
    }
};

export const deleteReservation = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(401).json({ error: "you are not authorized to delete a reservation" });
        return;
    }
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            res.status(404).json({ error: "Reservation not found" });
            return;
        }
        res.status(200).json({ message: "Reservation deleted successfully" });
        return
    } catch (error) {
        res.status(500).json({ error: "Failed to delete reservation" });
        return
    }
};

export const updateReservation = async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(401).json({ error: "you are not authorized to update a reservation" });
        return;
    }
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reservation) {
            res.status(404).json({ error: "Reservation not found" });
            return;
        }
        res.status(200).json(reservation);
        return
    } catch (error) {
        res.status(500).json({ message: "Failed to update reservation" });
        return
    }
};