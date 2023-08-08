import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getConfigurations))
router.put('/', withContext(updateConfigurations))

export default router
