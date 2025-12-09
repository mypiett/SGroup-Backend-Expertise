import { redisClient } from '@/config/redisClient';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
interface BoardInvitationEmailOptions {
  to: string;
  boardTitle: string;
  inviterName: string;
  roleName: string;
  link?: string;
}

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
      redisClient.del(`verify:${oldToken}`);
    }
    const token = uuidv4();
    const ttl = 15 * 60;
    redisClient.set(`verify:${token}`, email, { EX: ttl });
    redisClient.set(`email:${email}`, token, { EX: ttl });

    const link = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;
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
    this.transporter.sendMail({
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

  async sendBoardInvitationEmail(options: BoardInvitationEmailOptions) {
    const { to, boardTitle, inviterName, roleName, link } = options;

    const boardLink = link || `${process.env.BACKEND_URL}/boards`;

    await this.transporter.sendMail({
      from: `"TrelloClone" <${process.env.SMTP_USER}>`,
      to,
      subject: `You were added to board "${boardTitle}"`,
      html: `
        <h3>Hello!</h3>
        <p>${inviterName} has added you to the board "<b>${boardTitle}</b>" as <b>${roleName}</b>.</p>
        <p>Click <a href="${boardLink}">here</a> to access the board.</p>
      `,
    });
  }
}
