// lib/email.ts

import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  console.log('Sending verification email to:', email)
  console.log('Email host:', process.env.EMAIL_SERVER_HOST)
  console.log('Email user:', process.env.EMAIL_SERVER_USER)
  
  // Check if environment variables are set
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
    console.error('Email environment variables are not set properly')
    throw new Error('Email configuration missing')
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Auth App" <noreply@auth-app.com>',
    to: email,
    subject: 'Verify Your Email Address',
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email Address</h1>
        <p>Hello,</p>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    
    // Provide more helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check your email credentials.')
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to email server. Check your host and port.')
    } else {
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }
}