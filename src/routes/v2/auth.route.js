import { Router } from "express";
import { login, logout } from "../../modules/auth/auth.controller.js";

export const router = Router();

router.post("/login", login);

router.post("/logout", logout);
