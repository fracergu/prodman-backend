import { login, logout, register } from '@controllers/auth.controller'
import { withContext } from '@utils/context'
import express from 'express'

const router = express.Router()

router.post('/login', withContext(login))
router.post('/register', withContext(register))
router.delete('/logout', withContext(logout))

export default router
