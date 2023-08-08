import { Router } from 'express'
import authRoutes from './auth.routes'
import configRoutes from './config.routes'
import userRoutes from './users.routes'
import { errorHandler } from '@middlewares/error.middleware'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'

const apiRouter = Router()

const openApiDocument = yaml.load('./docs/openapi.yaml')

export const apiVersion = openApiDocument.info.version

// API version specific routes
apiRouter.use('/auth', authRoutes)
apiRouter.use('/config', configRoutes)
apiRouter.use('/users', userRoutes)

// Error handler
apiRouter.use(errorHandler)

apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
apiRouter.get('/openapi', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(openApiDocument)
})

export default apiRouter
