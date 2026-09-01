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

/* ======================================================
   MODERATION OUTCOME EMAIL
====================================================== */

export async function sendModerationEmail(
  email: string,
  params: {
    itemType: 'post' | 'suggestion';
    outcome: 'approved' | 'rejected';
    subjectName?: string;
    rejectionReason?: string;
    itemUrl?: string;
  }
) {
  console.log("📧 Attempting to send moderation email to:", email)

  if (
    !process.env.EMAIL_SERVER_HOST ||
    !process.env.EMAIL_SERVER_USER ||
    !process.env.EMAIL_SERVER_PASSWORD
  ) {
    console.log("⚠️ Email environment variables are not set properly")
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

  const itemLabel = params.itemType === 'post' ? 'record' : 'suggestion';
  const subjectLine =
    params.outcome === 'approved'
      ? `Your ${itemLabel} has been published`
      : `Your ${itemLabel} was not published`;

  const bodyHtml =
    params.outcome === 'approved'
      ? `
        <h1>Your ${itemLabel} has been published</h1>
        <p>Your ${itemLabel}${params.subjectName ? ` about ${params.subjectName}` : ''} passed language review and is now live on Malakia.</p>
        ${params.itemUrl ? `<p style="text-align: center; margin: 30px 0;">
          <a href="${params.itemUrl}" style="background-color: #1C2024; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View it
          </a>
        </p>` : ''}
      `
      : `
        <h1>Your ${itemLabel} was not published</h1>
        <p>Your ${itemLabel}${params.subjectName ? ` about ${params.subjectName}` : ''} did not pass language review.</p>
        ${params.rejectionReason ? `<p><strong>Reason:</strong> ${params.rejectionReason}</p>` : ''}
        <p>This is a language check only — it is not a judgment on the substance of what you wrote.</p>
      `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Malakia" <noreply@malakia.company>',
    to: email,
    subject: subjectLine,
    text: bodyHtml.replace(/<[^>]+>/g, ''),
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">${bodyHtml}</div>`,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Moderation email sent:", info.messageId)
    return info
  } catch (error: any) {
    console.error("❌ Moderation email failed:", error.message)
    return Promise.resolve()
  }
}