import { Router } from "express";
import {createOrder, getOrder } from "../../modules/order/order.controller.js";

export const router = Router();

router.post("/", createOrder);
router.get("/", getOrder);
