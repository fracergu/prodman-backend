import { errorHandler } from '@middlewares/error.middleware'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'

import authRoutes from './auth.routes'
import configRoutes from './config.routes'
import productionRoutes from './production.routes'
import productRoutes from './products.routes'
import taskRoutes from './tasks.routes'
import userRoutes from './users.routes'
import workerRoutes from './worker.routes'

const apiRouter = Router()

// API version specific routes
apiRouter.use('/auth', authRoutes)
apiRouter.use('/config', configRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/tasks', taskRoutes)
apiRouter.use('/worker', workerRoutes)
apiRouter.use('/production', productionRoutes)

// Error handler
apiRouter.use(errorHandler)

// OpenAPI documentation
export const apiVersion: string = '1'

const openApiDocument = yaml.load('./docs/openapi.yaml')

apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
apiRouter.get('/openapi', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(openApiDocument)
})

export default apiRouter
