import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {generateToken} from "../controllers/zego.controller.js";
const router = express.Router();

// Route to generate a token for a specific user
router.get('/token/:userId', generateToken,protectRoute);

export default router;