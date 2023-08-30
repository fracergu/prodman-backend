import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct
} from '@controllers/products.controller'
import { RequestError } from '@exceptions/RequestError'
import {
  mockCategory,
  mockProductCategory,
  mockProductsArray,
  mockProductsParsedArray
} from '@mocks/products.mock'
import { MockContext, createMockContext } from '@utils/context'
import { type Request, type Response } from 'express'

describe('ProductsController', () => {
  let context: MockContext
  let req: Request
  let res: Response

  const mockRequest = (query: Partial<Request['query']> = {}) => {
    return { query } as any
  }

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    }
    return res as Response
  }

  beforeEach(() => {
    context = createMockContext()
    req = mockRequest({
      session: {
        cookie: {},
        destroy: jest.fn(callback => callback())
      } as any,
      headers: {}
    })
    res = mockResponse()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should return all products categories', async () => {
      context.prisma.category.findMany.mockResolvedValue([mockCategory])
      await getCategories(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([mockCategory])
    })
  })

  describe('getCategories with search query', () => {
    it('should return all products categories', async () => {
      req.query = { search: 'test' }
      context.prisma.category.findMany.mockResolvedValue([mockCategory])
      await getCategories(req, res, context)
      expect(context.prisma.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                contains: 'test',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'test',
                mode: 'insensitive'
              }
            }
          ]
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([mockCategory])
    })
  })

  describe('createCategory', () => {
    it('should create a product category', async () => {
      req.body = { name: 'test', description: 'test' }
      context.prisma.category.create.mockResolvedValue(mockCategory)
      await createCategory(req, res, context)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockCategory)
    })
  })

  describe('updateCategory', () => {
    it('should update a product category', async () => {
      const mockUpdatedCategory = {
        ...mockCategory,
        name: 'updated',
        description: 'updated'
      }
      req.params = { id: '1' }
      req.body = { name: 'updated', description: 'updated' }
      context.prisma.category.update.mockResolvedValue(mockUpdatedCategory)
      await updateCategory(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockUpdatedCategory)
    })
  })

  describe('deleteCategory', () => {
    it('should delete a product category', async () => {
      req.params = { id: '1' }

      context.prisma.productCategory.deleteMany.mockResolvedValue({} as any)
      context.prisma.category.delete.mockResolvedValue({} as any)
      await deleteCategory(req, res, context)

      expect(context.prisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: 1 }
      })
      expect(context.prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('getProducts', () => {
    const include = {
      productCategories: {
        include: {
          category: true
        }
      },
      productComponents: {
        include: {
          child: true
        }
      }
    }

    it('should return parsed products with default pagination', async () => {
      req = mockRequest({ limit: '1', page: '2' })
      context.prisma.$transaction.mockResolvedValue([
        2,
        [mockProductsArray[1], mockProductsArray[2]]
      ])
      await getProducts(req, res, context)
      expect(context.prisma.product.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 1,
        where: {
          active: true
        },
        include
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockProductsParsedArray[1]],
        total: 2,
        nextPage: 3,
        prevPage: 1
      })
    })

    it('should return parsed products with search', async () => {
      req = mockRequest({ limit: '1', page: '1', search: 'Product 1' })
      context.prisma.$transaction.mockResolvedValue([1, [mockProductsArray[0]]])
      await getProducts(req, res, context)
      expect(context.prisma.product.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 0,
        where: {
          active: true,
          OR: [
            {
              name: {
                contains: 'Product 1',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'Product 1',
                mode: 'insensitive'
              }
            },
            {
              reference: {
                contains: 'Product 1',
                mode: 'insensitive'
              }
            }
          ]
        },
        include
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockProductsParsedArray[0]],
        total: 1,
        nextPage: null,
        prevPage: null
      })
    })

    it('should return parsed products with category', async () => {
      req = mockRequest({ limit: '1', page: '1', category: '1' })
      context.prisma.$transaction.mockResolvedValue([1, [mockProductsArray[2]]])
      await getProducts(req, res, context)
      expect(context.prisma.product.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 0,
        where: {
          active: true,
          productCategories: {
            some: {
              categoryId: 1
            }
          }
        },
        include
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockProductsParsedArray[2]],
        total: 1,
        nextPage: null,
        prevPage: null
      })
    })

    it('should return parsed products with inactive filter', async () => {
      req = mockRequest({ limit: '1', page: '1', inactive: 'true' })
      context.prisma.$transaction.mockResolvedValue([1, [mockProductsArray[2]]])
      await getProducts(req, res, context)
      expect(context.prisma.product.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 0,
        where: {
          active: false
        },
        include
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockProductsParsedArray[2]],
        total: 1,
        nextPage: null,
        prevPage: null
      })
    })
  })

  describe('createProduct', () => {
    it('should create a product with categories and components', async () => {
      req.body = {
        name: 'Product 3',
        description: 'Product 3 description',
        price: 10.99,
        image: null,
        active: true,
        categories: ['1'],
        components: [{ id: '6', quantity: 5 }]
      }
      context.prisma.product.create.mockResolvedValue(mockProductsArray[2])
      context.prisma.productCategory.create.mockResolvedValue(
        mockProductCategory
      )
      await createProduct(req, res, context)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockProductsParsedArray[2])
    })

    it('should create a product without categories and components', async () => {
      req.body = {
        name: 'Product 3',
        description: 'Product 3 description',
        price: 10.99,
        image: null,
        active: true
      }
      context.prisma.product.create.mockResolvedValue(mockProductsArray[0])
      await createProduct(req, res, context)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockProductsParsedArray[0])
    })
  })

  describe('updateProduct', () => {
    it('should update a product with categories and components', async () => {
      req.params = { id: '7' }
      req.body = {
        name: 'Product 3',
        description: 'Product 3 description',
        price: 10.99,
        image: null,
        active: true,
        categories: ['1'],
        components: [{ id: '6', quantity: 5 }]
      }
      context.prisma.product.update.mockResolvedValue(mockProductsArray[2])
      context.prisma.productCategory.create.mockResolvedValue(
        mockProductCategory
      )
      await updateProduct(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockProductsParsedArray[2])
    })

    it('should update a product without categories and components', async () => {
      req.params = { id: '7' }
      req.body = {
        name: 'Product 3',
        description: 'Product 3 description',
        price: 10.99,
        image: null,
        active: true
      }
      context.prisma.product.update.mockResolvedValue(mockProductsArray[0])
      await updateProduct(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockProductsParsedArray[0])
    })
    it('should throw an error if product is a component of itself', async () => {
      req.params = { id: '7' }
      req.body = {
        components: [{ productId: 7, quantity: 5 }]
      }
      await updateProduct(req, res, context).catch(err => {
        expect(err).toEqual(
          new RequestError(400, 'Product cannot be a component of itself')
        )
      })
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      req.params = { id: '7' }
      context.prisma.product.delete.mockResolvedValue({} as any)
      context.prisma.productCategory.deleteMany.mockResolvedValue({} as any)
      context.prisma.productComponent.deleteMany.mockResolvedValue({} as any)
      await deleteProduct(req, res, context)
      expect(context.prisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { productId: 7 }
      })
      expect(context.prisma.productComponent.deleteMany).toHaveBeenCalledWith({
        where: { parentId: 7 }
      })
      expect(context.prisma.productComponent.deleteMany).toHaveBeenCalledWith({
        where: { childId: 7 }
      })
      expect(context.prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 7 }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
