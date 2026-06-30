// lib/email.ts

import nodemailer from "nodemailer"

/* ======================================================
   VERIFICATION EMAIL
====================================================== */

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  console.log("📧 Attempting to send verification email to:", email)

  if (
    !process.env.EMAIL_SERVER_HOST ||
    !process.env.EMAIL_SERVER_USER ||
    !process.env.EMAIL_SERVER_PASSWORD
  ) {
    console.log("⚠️ Email environment variables are not set properly")
    console.log("🔗 Verification URL (manual):", verificationUrl)
    return Promise.resolve()
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Auth App" <noreply@auth-app.com>',
    to: email,
    subject: "Verify Your Email Address",
    text: `Verify your email: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify Your Email Address</h1>
        <p>Thank you for registering.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #0070f3; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Verification email sent:", info.messageId)
    return info
  } catch (error: any) {
    console.error("❌ Verification email failed:", error.message)
    console.log("🔗 Manual verification URL:", verificationUrl)
    return Promise.resolve()
  }
}

/* ======================================================
   PASSWORD RESET EMAIL
====================================================== */

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  console.log("📧 Attempting to send password reset email to:", email)

  if (
    !process.env.EMAIL_SERVER_HOST ||
    !process.env.EMAIL_SERVER_USER ||
    !process.env.EMAIL_SERVER_PASSWORD
  ) {
    console.log("⚠️ Email environment variables not set")
    console.log("🔗 Password reset URL (manual):", resetUrl)
    return Promise.resolve()
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Auth App" <noreply@auth-app.com>',
    to: email,
    subject: "Reset Your Password",
    text: `Reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>You requested a password reset.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #0070f3; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Password reset email sent:", info.messageId)
    return info
  } catch (error: any) {
  console.error("🔥 PASSWORD RESET EMAIL ERROR:", error)
  throw error // ← TEMPORARY, for debugging
}

}
