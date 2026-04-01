const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a 6-digit OTP to the user's email.
 */
exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"BOOKLOOP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verification Code for BOOKLOOP',
    text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; border-radius: 12px; background-color: #f9f9f9; max-width: 500px; margin: auto;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to BOOKLOOP</h2>
        <p style="color: #666; font-size: 16px;">Securely register or sign in to your account with the following verification code:</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; text-align: center; border: 1px dashed #4f46e5; margin: 20px 0;">
          <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 12px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2026 BOOKLOOP. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Sends a welcome email after successful registration.
 */
exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"BOOKLOOP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to BOOKLOOP!',
    text: `Hi ${name}, welcome to BOOKLOOP! Start trading and sharing books today.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; border-radius: 12px; background-color: #f9f9f9; max-width: 500px; margin: auto;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to the Loop! 📚</h2>
        <p style="color: #333; font-size: 18px;">Hi ${name},</p>
        <p style="color: #666; font-size: 16px;">We're thrilled to have you join <strong>BOOKLOOP</strong>. Start exploring available books, connecting with other book lovers, and building your own library today!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Browse Books</a>
        </div>
        <p style="color: #666; font-size: 14px;">Happy Reading,<br>The BOOKLOOP Team</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2026 BOOKLOOP. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};
