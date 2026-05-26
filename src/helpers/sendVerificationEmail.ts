import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Mystry Message" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mystry Message — Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px; background: #f8f6f3;">
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #141312;">Hello, ${username}!</h2>
              <p style="color: #78736a; margin: 0 0 24px 0; font-size: 14px;">
                Thank you for registering with Mystry Message. Use the code below to verify your account:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; font-family: monospace; color: #0d9488;">
                  ${verifyCode}
                </span>
              </div>
              <p style="color: #78736a; font-size: 13px; margin: 0;">
                This code expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, message: "Verification email sent successfully" };

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Email error:", error.message);
    } else {
      console.error("Unknown email error:", error);
    }
    return { success: false, message: "Failed to send verification email" };
  }
}