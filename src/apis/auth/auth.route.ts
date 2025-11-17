// backend/src/apis/auth/auth.route.ts
import { Router } from "express";
import { AuthController } from "./auth.controller";
import authenticateJWT from "../../common/middleware/authentication";
import { uploadAvatar } from "../../common/middleware/upload.middleware";
const route = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Create a new user account with fullName, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ""
 *               email:
 *                 type: string
 *                 example: ""
 *               password:
 *                 type: string
 *                 example: ""
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Register successfully
 *       400:
 *         description: Validation error or email already exists
 */
route.post('/register', (req, res) => AuthController.register(req, res));

/**
 * @swagger
 * /api/auth/login:
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
 *                 example: nguyenvana@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *             required:
 *               - email
 *               - password
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

// ✅ Update profile by :id
route.put("/:id/profile", authenticateJWT, (req, res) => AuthController.updateProfile(req, res));


// ✅ Update avatar by :id
route.post("/:id/avatar", authenticateJWT, uploadAvatar.single("avatar"), (req, res) => AuthController.updateAvatar(req, res));


export default route;
