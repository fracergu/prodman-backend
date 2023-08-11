import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask
} from '@controllers/tasks.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getTasks))
router.get('/:id', withContext(getTask))
router.post('/', withContext(createTask))
router.put('/:id', withContext(updateTask))
router.delete('/:id', withContext(deleteTask))

export default router
