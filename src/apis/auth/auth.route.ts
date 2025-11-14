import { Router } from 'express';
import { AuthController } from './auth.controller';
import { EmailController } from './mail.controller';

const route = Router();
const authController = new AuthController();
const emailController = new EmailController();

/**
 * @swagger
 * /auth/request-verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request email verification token
 *     description: Send a verification token to the provided email if it is not already registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: p.etitett04@gmail.com
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Invalid email format or email already registered
 *       429:
 *         description: Too many requests — please wait before requesting again
 *       500:
 *         description: Failed to send verification email
 */
route.post(
  '/request-verify-email',
  emailController.requestVerifyEmail.bind(emailController)
);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify email using token
 *     description: Validate the email verification token sent to the user's email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token received via email
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Token is missing or invalid format
 *       410:
 *         description: Token expired
 *       500:
 *         description: Failed to verify email
 */
route.get('/verify-email', emailController.verifyEmail.bind(emailController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Create a new user account with name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Thanh Tuyen
 *               email:
 *                 type: string
 *                 format: email
 *                 example: p.etitett04@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "12345678"
 *     responses:
 *       201:
 *         description: Register successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Register successfully"
 *               user:
 *                 id: "67420f51bcd9bb32fbe13aaf"
 *                 name: "Thanh Tuyen"
 *                 email: "p.etitett04@gmail.com"
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
route.post('/register', authController.register.bind(authController));

/**
 * @swagger
 * /auth/login:
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
