import { Request, Response } from 'express';
import { EmailService } from './mail.service';
import { validateEmail } from '@/common/utils/validateEmail';
import { AppDataSource } from '@/config/data-source';
import { User } from '@/common/entities/user.entity';

const emailService = new EmailService();
export class EmailController {
  private userRepository = AppDataSource.getRepository(User);
  async requestVerifyEmail(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!validateEmail(email))
      return res.status(400).json({ message: 'Invalid email format' });
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail)
      return res.status(400).json({ message: 'Email already registered' });
    try {
      await emailService.sendVerificationEmail(email);
      return res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
      console.log('Bug 1', error);
      return res
        .status(500)
        .json({ message: 'Failed to send verification email' });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;
    if (!token || typeof token !== 'string')
      return res.status(400).json({ message: 'Token is required' });
    try {
      const email = await emailService.verifyEmailToken(token);
      return res.status(200).json({ message: 'Email verified', email });
    } catch (error) {
      console.log('Bug 2', error);
      return res.status(500).json({ message: 'Failed to verify email' });
    }
  }
}
