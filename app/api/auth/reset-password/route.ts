// app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { prisma } from "../../../../lib/prisma"
import { validatePassword } from "../../../../lib/password"

export async function POST(request: Request) {
  try {
    // Parse request body
    const { token, password } = await request.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      )
    }

    // Get client IP
    const clientIP = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                    request.headers.get("x-real-ip") ||
                    "unknown"

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        ip: clientIP,
        expires: {
          gt: new Date() // Token not expired
        }
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid, expired, or mismatched token" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and increment token version
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.identifier },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      }),
      
      // Invalidate all user sessions
      prisma.session.deleteMany({
        where: {
          user: {
            email: resetToken.identifier,
          },
        },
      }),
      
      // Delete used reset token
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
      
      // Log password change
      prisma.passwordAuditLog.create({
        data: {
          email: resetToken.identifier,
          ip: clientIP,
          // Removed 'action' field as it doesn't exist in your schema
        },
      }),
    ])

    // Send notification email
    await sendPasswordChangeNotification(resetToken.identifier, clientIP)

    return NextResponse.json({ 
      success: true,
      message: "Password reset successful"
    })

  } catch (error) {
    console.error("Password reset error:", error)
    
    return NextResponse.json(
      { 
        error: "An internal server error occurred",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Send email notification for password change
 */
async function sendPasswordChangeNotification(email: string, ip: string) {
  try {
    // Check if email configuration exists
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email configuration missing, skipping notification")
      return
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Security" <noreply@${process.env.SMTP_HOST}>`,
      to: email,
      subject: "Your Password Was Changed",
      text: `Your password was successfully changed.\n\n` +
            `Details:\n` +
            `- IP Address: ${ip}\n` +
            `- Time: ${new Date().toLocaleString()}\n\n` +
            `If you did not initiate this change, please contact support immediately.\n\n` +
            `Thank you,\n` +
            `Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed Successfully</h2>
          <p>Your password was successfully changed.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>IP Address: ${ip}</li>
              <li>Time: ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="color: #d32f2f; font-weight: bold;">
            If you did not initiate this change, please contact support immediately.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 0.9em;">
            Thank you,<br>
            Security Team
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password change notification sent to ${email}`)
    
  } catch (error) {
    console.error("Failed to send password change notification:", error)
    // Don't throw - failing to send email shouldn't fail the password reset
  }
}