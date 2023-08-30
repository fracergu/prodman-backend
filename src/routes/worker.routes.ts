import {
  completeSubtask,
  getActiveWorkers,
  getTask
} from '@controllers/worker.controller'
import { requireSession } from '@middlewares/auth.middleware'
import { withContext } from '@utils/context'
import express from 'express'

const router = express.Router()

router.get('/active', withContext(getActiveWorkers))

router.get('/task', withContext(requireSession), withContext(getTask))

router.post(
  '/completeSubtask/:subtaskId',
  withContext(requireSession),
  withContext(completeSubtask)
)

export default router
