import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateUserCredentials
} from '@controllers/users.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getUsers))
router.get('/:id', withContext(getUser))
router.post('/', withContext(createUser))
router.put('/:id', withContext(updateUser))
router.put('/:id/credentials', withContext(updateUserCredentials))

export default router
