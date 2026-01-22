import { Resend } from "resend";
import { env } from "../utils/env.js";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * ส่ง email reset password
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "VELVE <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password - VELVE",
      html: getPasswordResetEmailTemplate(userName, resetUrl),
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error("Failed to send email");
    }

    console.log("✅ Email sent successfully:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

/**
 * Email template
 */
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #CB5585 0%, #A7CBCB 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          padding: 14px 30px;
          margin: 20px 0;
          background-color: #CB5585;
          color: white !important;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
        }
        .info-box {
          background-color: #FFF3F8;
          border-left: 4px solid #CB5585;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VELVÉ</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hi ${userName || "there"},</p>
          <p>You requested to reset your password. Click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="info-box">
            <strong>⏰ Important:</strong> This link expires in <strong>1 hour</strong>.
          </div>
          
          <p>Or copy this link:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * ส่ง email ยืนยันว่าเปลี่ยน password สำเร็จ (optional)
 */
export const sendPasswordChangedEmail = async (email, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "VELVE <onboarding@resend.dev>",
      to: email,
      subject: "Password Changed Successfully - VELVE",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #CB5585;">Password Changed</h2>
          <p>Hi ${userName || "there"},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you didn't make this change, contact support immediately.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Confirmation email error:", error);
      return { success: false };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Confirmation email failed:", error);
    return { success: false };
  }
};
