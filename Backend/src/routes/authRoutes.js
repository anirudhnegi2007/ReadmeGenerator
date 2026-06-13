import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
 
const router = express.Router();

router.post("/login", apiLimiter, loginUser);
router.post("/register", apiLimiter, registerUser);

export default router;