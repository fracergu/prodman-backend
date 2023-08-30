import {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} from '@controllers/tasks.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getTasks))
router.post('/', withContext(createTask))
router.put('/:id', withContext(updateTask))
router.delete('/:id', withContext(deleteTask))

export default router
