import { errorHandler } from '@middlewares/error.middleware'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'

import authRoutes from './auth.routes'
import configRoutes from './config.routes'
import productRoutes from './products.routes'
import taskRoutes from './tasks.routes'
import userRoutes from './users.routes'

const apiRouter = Router()

const openApiDocument = yaml.load('./docs/openapi.yaml')

export const apiVersion = openApiDocument.info.version as string

// API version specific routes
apiRouter.use('/auth', authRoutes)
apiRouter.use('/config', configRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/tasks', taskRoutes)
apiRouter.use(errorHandler)

// Error handler

apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
apiRouter.get('/openapi', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(openApiDocument)
})

export default apiRouter
