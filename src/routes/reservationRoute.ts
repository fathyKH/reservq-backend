import express from "express";
import {
    createReservation,
    deleteReservation,
    getReservation,
    getAllReservations,
    getAllUserReservations,
    updateReservation,
} from "../controllers/reservationController";
import { get } from "http";

const router = express.Router();

router.get("/reservations", getAllReservations);
router.get("/user/reservations", getAllUserReservations);
router.get("/reservation/:id", getReservation);
router.post("/reservation/add", createReservation);
router.patch("/reservation/:id", updateReservation);
router.delete("/reservation/:id", deleteReservation);

export default router;