import jwt from "jsonwebtoken";
import User from "../users/users.model.js";
import bcrypt from "bcryptjs";
import { env } from "../../utils/env.js";

const isProd = env.NODE_ENV === "production";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({ message: "🎀login success" });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(500).json({ message: "Server Login error🍡🐟" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.status(200).json({ message: "Logout success" });
};
