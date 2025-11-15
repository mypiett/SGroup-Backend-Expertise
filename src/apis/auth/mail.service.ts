import { redisClient } from '@/config/redisClient';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

export class EmailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string) {
    const oldToken = await redisClient.get(`email:${email}`);
    if (oldToken) {
      await redisClient.del(`verify:${oldToken}`);
    }
    const token = uuidv4();
    const ttl = 15 * 60;
    await redisClient.set(`verify:${token}`, email, { EX: ttl });
    await redisClient.set(`email:${email}`, token, { EX: ttl });

    const link = `http://localhost:3000/auth/verify-email?token=${token}`;
    console.log(`[TEST] Verification link for ${email}: ${link}`);

    await this.transporter.sendMail({
      from: `"TrelloClone" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<h3>Welcome!</h3><p>Click <a href="${link}">here</a> to verify your email.</p>`,
    });
  }

  async verifyEmailToken(token: string) {
    const email = await redisClient.get(`verify:${token}`);
    if (!email) throw new Error('Invalid or expired token');
    await redisClient.del(`verify:${token}`);
    await redisClient.set(`verified:${email}`, 'true');
    return email;
  }

  async sendForgotPasswordEmail(email: string, code: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h3>Password Reset Request</h3>
        <p>Use the following code to reset your password. It is valid for 15 minutes:</p>
        <h2 style="color: #333;">${code}</h2>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }
}
