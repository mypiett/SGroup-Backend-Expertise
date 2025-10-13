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
route.post('/register', AuthController.register);

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
route.post('/login', AuthController.login);

route.post('/refreshToken', AuthController.refreshToken);

export default route;
