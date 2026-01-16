import { Router } from "express";
import contactRoute from './contact.route.js';

export const router = Router()

router.use('/contact', contactRoute);