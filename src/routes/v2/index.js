import { Router } from "express";
import { router as userRoutes } from "./user.route.js";
import { router as authRoutes } from "./auth.route.js";

export const router = Router();

router.use("/user", userRoutes);

router.use("/auth", authRoutes);
