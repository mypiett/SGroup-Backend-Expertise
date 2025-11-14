import { Router } from 'express';
import { AuthController } from './auth.controller';
import { EmailController } from './mail.controller';

const route = Router();
const authController = new AuthController();
const emailController = new EmailController();

route.post(
  '/request-verify-email',
  emailController.requestVerifyEmail.bind(emailController)
);

route.get('/verify-email', emailController.verifyEmail.bind(emailController));
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Create a new user account with fullName, email, and password
 *     responses:
 *       201:
 *         description: Register successfully
 *       400:
 *         description: Validation error or email already exists
 */
route.post('/register', authController.register.bind(authController));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Login with email and password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
route.post('/login', authController.login.bind(authController));

route.post('/refreshToken', authController.refreshToken.bind(authController));

route.get('/me', authController.getMe.bind(authController));

route.post('/logout', authController.logout.bind(authController));

export default route;
