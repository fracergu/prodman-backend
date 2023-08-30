import {
  getProductionReport,
  getSubtaskEvents
} from '@controllers/production.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getSubtaskEvents))

router.get('/report', withContext(getProductionReport))

export default router
