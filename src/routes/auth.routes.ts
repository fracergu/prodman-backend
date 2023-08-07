import { login, logout, register } from '@controllers/auth.controller'
import { PrismaClient } from '@prisma/client'
import { type Context } from '@utils/context'
import express from 'express'

const context: Context = {
  prisma: new PrismaClient()
}

const withContext = (fn: any) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    fn(req, res, next, context).catch(next)
  }
}

const router = express.Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login a user
 *     security:
 *     - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rememberMe:
 *                 type: boolean
 *                 description: Whether to remember the user or not
 *                 example: true
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', withContext(login))

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *                 example: John
 *               lastName:
 *                type: string
 *                description: The user's last name
 *                example: Doe
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: Very$ecureP@ssword
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 *
 */
router.post('/register', withContext(register))

/**
 * @openapi
 * /auth/logout:
 *   delete:
 *     tags:
 *       - auth
 *     summary: Logout a user
 *   responses:
 *     200:
 *       description: Successful operation
 *     500:
 *       description: Internal server error
 */
router.delete('/logout', withContext(logout))

export default router
