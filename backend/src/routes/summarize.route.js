import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { summarizeText } from "../controllers/summarize.controller.js";

const router = express.Router();

router.post("/", protectRoute, summarizeText);

export default router;
