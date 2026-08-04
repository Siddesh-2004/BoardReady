import { Router } from "express";
import { submitScore } from "../controllers/score.controller.js";

const router = Router();

router.post("/:boardId/score", submitScore);

export default router;  