// backend/src/apis/users/user.route.ts
import { Router } from 'express';
import { UserController } from './users.controller';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

const route = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Get all user
 *     responses:
 *       200:
 *         description: Get data user successfully
 *       500:
 *         description: Server Error
 */
route.get('/', authenticateJWT, (req, res) =>
    UserController.getAllUsers(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get detail information user successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server Error
 */
route.get('/:id', authenticateJWT, (req, res) =>
    UserController.getDetailUser(req, res));

/**
 * @swagger
 * /api/users/{id}/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update personal information of a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 */
route.put('/:id/profile', authenticateJWT, (req, res) =>
    UserController.updateProfile(req, res));

/**
 * @swagger
 * /api/users/{id}/avatar:
 *   post:
 *     tags:
 *       - Users
 *     summary: Upload user avatar
 *     description: Upload or change user avatar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Bad request
 */
route.post('/:id/avatar', authenticateJWT, uploadAvatar.single('avatar'), (req, res) =>
    UserController.uploadAvatar(req, res)
);

export default route;
