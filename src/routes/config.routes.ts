import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.get('/', withContext(getConfigurations))
router.put(
  '/',
  withContext(requireAdminRole),
  withContext(updateConfigurations)
)

export default router
