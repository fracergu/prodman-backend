import {
  createCategory,
  createProduct,
  deleteCategory,
  getCategories,
  getProduct,
  getProducts,
  updateCategory,
  updateProduct
} from '@controllers/products.controller'
import { withContext } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/categories/', withContext(getCategories))
router.post('/categories/', withContext(createCategory))
router.put('/categories/:id', withContext(updateCategory))
router.delete('/categories/:id', withContext(deleteCategory))

router.get('/', withContext(getProducts))
router.post('/', withContext(createProduct))
router.get('/:id', withContext(getProduct))
router.put('/:id', withContext(updateProduct))

export default router
