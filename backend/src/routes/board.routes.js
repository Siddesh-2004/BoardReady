import express from "express";
import { createBoard } from "../controllers/board.controller.js";

const router = express.Router();

router.post("/", createBoard);

export default router;