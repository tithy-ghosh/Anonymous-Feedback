import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);  // ← Add this
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);  // ← Add this

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});