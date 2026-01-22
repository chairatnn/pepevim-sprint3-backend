import jwt from "jsonwebtoken";
import User from "../users/users.model.js";
import bcrypt from "bcryptjs";
import { env } from "../../utils/env.js";

import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "../../services/email.service.js";

import crypto from "crypto";

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

/**
 * ✅ FORGOT PASSWORD - ขอ reset password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // หา user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: ไม่บอกว่า email มีหรือไม่
    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // สร้าง random token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token ก่อนเก็บใน DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // เก็บ token + expiry ใน DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // ส่ง email (ส่ง token ดิบไม่ใช่ hashed)
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken, // ส่ง token แบบไม่ hash
        user.first_name,
      );

      return res.status(200).json({
        message: "Password reset email sent successfully",
      });
    } catch (emailError) {
      // ถ้าส่ง email ไม่สำเร็จ ให้ลบ token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("Failed to send email:", emailError);
      return res.status(500).json({
        error: "Failed to send reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * ✅ RESET PASSWORD - ตั้ง password ใหม่
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate
    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 64) {
      return res.status(400).json({
        error: "Password must be between 8-64 characters",
      });
    }

    // Hash token ที่ได้รับ เพื่อเทียบกับที่เก็บใน DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // หา user ที่มี token นี้และยังไม่หมดอายุ
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    // Hash password ใหม่
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // ลบ reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // ส่ง email ยืนยัน (optional)
    await sendPasswordChangedEmail(user.email, user.first_name).catch((err) =>
      console.error("Failed to send confirmation:", err),
    );

    return res.status(200).json({
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * ✅ VERIFY TOKEN - ตรวจสอบว่า token ยังใช้ได้หรือไม่ (optional)
 */
export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        error: "Invalid or expired token",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("❌ Verify token error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
