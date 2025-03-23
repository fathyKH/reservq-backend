import express from "express";
import { getComments, createComment, deleteComment, editComment } from "../controllers/commentController";

const router = express.Router();

router.get('/comments/:id', getComments);
router.post('/comment/add', createComment);
router.patch('/comment/:id', editComment);
router.delete('/comment/delete/:id', deleteComment);

export default router;