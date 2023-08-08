import { initializeDefaultConfigurations } from '@utils/config'
import genFunc from 'connect-pg-simple'
import dotenv from 'dotenv'
import express, { type Express } from 'express'
import session from 'express-session'

import apiRouter, { apiVersion } from './routes/api.routes'

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

app.use(`/api/v${apiVersion}`, apiRouter)

initializeDefaultConfigurations()
  .then(() => {
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
    })
  })
  .catch(err => {
    console.error('Error initializing default configurations: ', err)
    process.exit(1)
  })
