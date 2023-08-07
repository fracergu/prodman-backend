import authRoutes from '@routes/auth.routes'
import { errorHandler } from '@utils/errorHandler'
import genFunc from 'connect-pg-simple'
import dotenv from 'dotenv'
import express, { type Express } from 'express'
import session from 'express-session'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi, { JsonObject } from 'swagger-ui-express'

dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 3000

declare module 'express-session' {
  interface SessionData {
    user: number
  }
}

const PostgreslqStore = genFunc(session)
const sessionStore = new PostgreslqStore({
  conString: process.env.DATABASE_URL
})

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true },
    store: sessionStore
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)

// Error handler
app.use(errorHandler)

const options: JsonObject = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prodman API',
      version: '0.1.0',
      description:
        'This is the API documentation for Prodman, a production management tool.'
    },
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
}

const specs = swaggerJSDoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
