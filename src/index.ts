import express, { type Express, type Request, type Response } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const app: Express = express()
const port = process.env.PORT ?? 3000

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prodman API',
      version: '0.1.0',
      description:
        'This is the API documentation for Prodman, a production management tool.'
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
}

const specs = swaggerJSDoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
