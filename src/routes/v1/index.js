import { Router } from "express";
import contactRoute from './contact.route.js';
import { router as dashboardRoute } from "./dashboard.route.js";
export const router = Router()

router.use('/contact', contactRoute);
router.use("/dashboard",dashboardRoute)
//  /v1/contact