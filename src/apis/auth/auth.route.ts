import { Router } from 'express';
import { AuthController } from './auth.controller';

const route = Router();

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
route.post('/register', (req, res) => AuthController.register(req, res));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     example:
 *       email: user@example.com
 *       password: yourpassword
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
route.post('/login', (req, res) => AuthController.login(req, res));

route.post('/refreshToken', (req, res) =>
  AuthController.refreshToken(req, res)
);

route.get('/me', (req, res) => AuthController.getMe(req, res));

route.post('/logout', (req, res) => AuthController.logout(req, res));

export default route;
