import { login, logout, register, session } from '@controllers/auth.controller'
import { requireSession } from '@middlewares/auth.middleware'
import { withContext } from '@utils/context'
import express from 'express'

const router = express.Router()

router.post('/login', withContext(login))
router.post('/register', withContext(register))
router.delete('/logout', withContext(logout))

router.get('/session', withContext(requireSession), withContext(session))

export default router
