import { Router } from 'express';
import { UserController } from './users.controller';

const route = Router();
// const userController = new UserController();

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
route.route('/').get(UserController.getAllUsers);

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
route.route('/:id').get(UserController.getDetailUser)


export default route;
