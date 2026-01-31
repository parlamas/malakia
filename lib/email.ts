// lib/email.ts

import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  console.log('📧 Attempting to send verification email to:', email)
  
  // Check if environment variables are set
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log('⚠️ Email environment variables are not set properly')
    console.log('🔗 For testing, verification URL would be:', verificationUrl)
    console.log('ℹ️ In production, set these in .env.local:')
    console.log('   EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD')
    
    // Don't throw an error - just log and return
    // This allows registration to succeed even if email fails
    return Promise.resolve()
  }

  console.log('✅ Email credentials found, attempting to send...')

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
    console.log('✅ Email sent successfully!')
    console.log('📨 Message ID:', info.messageId)
    
    // If using Ethereal email, show preview URL
    if (process.env.EMAIL_SERVER_HOST === 'smtp.ethereal.email') {
      console.log('👀 Preview URL:', nodemailer.getTestMessageUrl(info))
    }
    
    return info
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message)
    
    // Don't throw the error - just log it
    // This allows registration to succeed even if email fails
    console.log('⚠️ Email failed but registration will still succeed')
    console.log('🔗 Verification URL for manual testing:', verificationUrl)
    
    // Provide helpful debug info
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Check:')
      console.error('   - Email credentials in .env.local')
      console.error('   - For Gmail: Use App Password, not regular password')
      console.error('   - For Ethereal: Get new credentials at https://ethereal.email')
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check:')
      console.error('   - EMAIL_SERVER_HOST and EMAIL_SERVER_PORT')
      console.error('   - Internet connection')
    }
    
    // Return resolved promise instead of throwing
    return Promise.resolve()
  }
}