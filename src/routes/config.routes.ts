import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { PrismaClient } from '@prisma/client'
import { type Context } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

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

router.use(withContext(requireAdminRole))

/**
 * @openapi
 * /config:
 *   get:
 *     tags:
 *       - config
 *     summary: Get all configurations
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registerEnabled:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', withContext(getConfigurations))

/**
 * @openapi
 * /config:
 *   put:
 *     tags:
 *       - config
 *     summary: Update a configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key of the configuration
 *                 example: 'configKey1'
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                 description: The value of the configuration
 *                 example: false
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   oneOf:
 *                     - type: string
 *                     - type: number
 *                     - type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put('/', withContext(updateConfigurations))

export default router
