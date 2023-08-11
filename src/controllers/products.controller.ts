import { RequestError } from '@exceptions/RequestError'
import {
  type CategoryCreationRequest,
  type ProductCreationRequest
} from '@models/products.model'
import { type Context } from '@utils/context'
import { getIntegerParam, isValidString } from '@utils/validation'
import { type Request, type Response } from 'express'

export const getCategories = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const categories = await ctx.prisma.category.findMany()
  res.status(200).json(categories)
}

export const createCategory = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { name, description } = req.body as CategoryCreationRequest
  const category = await ctx.prisma.category.create({
    data: {
      name,
      description
    }
  })
  res.status(201).json(category)
}

export const updateCategory = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { name, description } = req.body as CategoryCreationRequest

  const category = await ctx.prisma.category.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description
    }
  })

  res.status(200).json(category)
}

export const deleteCategory = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const category = await ctx.prisma.category.delete({
    where: { id: parseInt(id) }
  })
  res.status(200).json(category)
}

function _parseProductToView(product: any) {
  return {
    ...product,
    categories: product.ProductCategories.map(
      (pc: { Category: any }) => pc.Category
    ),
    components: product.ProductComponents.map(
      (pc: { quantity: any; Child: any }) => ({
        quantity: pc.quantity,
        product: pc.Child
      })
    ),
    ProductCategories: undefined,
    ProductComponents: undefined
  }
}

export const getProducts = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const limit = getIntegerParam(req.query.limit as string, 10)
  const page = getIntegerParam(req.query.page as string, 0)
  const search = req.query.search as string
  const category = req.query.category as string

  const whereCriteria: any = {}
  if (isValidString(search)) {
    whereCriteria.name = { contains: search }
  }
  if (isValidString(category)) {
    whereCriteria.ProductCategories = {
      some: {
        categoryId: parseInt(category)
      }
    }
  }

  const include = {
    ProductCategories: {
      include: {
        Category: true
      }
    },
    ProductComponents: {
      include: {
        Child: true
      }
    }
  }

  const products = await ctx.prisma.product.findMany({
    take: limit + 1,
    skip: (page - 1) * limit,
    include,
    where: whereCriteria
  })

  if (products.length === 0) {
    throw new RequestError(404, 'Not found')
  }

  const hasNextPage = products.length > limit
  if (hasNextPage) {
    products.pop()
  }

  const transformedProducts = products.map(_parseProductToView)

  res.status(200).json({
    data: transformedProducts,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
}

export const getProduct = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const product = await ctx.prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      ProductCategories: {
        include: {
          Category: true
        }
      },
      ProductComponents: {
        include: {
          Child: true
        }
      }
    }
  })

  if (product == null) {
    throw new RequestError(404, 'Not found')
  }

  res.status(200).json(_parseProductToView(product))
}

export const createProduct = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { name, description, price, reference, categories, components } =
    req.body as ProductCreationRequest

  const productCategories =
    categories !== undefined
      ? categories.map(categoryId => ({
          category: categoryId
        }))
      : undefined

  const productComponents =
    components !== undefined
      ? components.map(component => ({
          childProduct: component.productId,
          quantity: component.quantity
        }))
      : undefined

  const productData: any = {
    name,
    description,
    price,
    reference
  }

  if (productCategories != null) {
    productData.ProductCategories = {
      create: productCategories
    }
  }

  if (productComponents != null) {
    productData.ProductComponents = {
      create: productComponents
    }
  }

  const product = await ctx.prisma.product.create({
    data: productData,
    include: {
      ProductCategories: {
        include: {
          Category: true
        }
      },
      ProductComponents: {
        include: {
          Child: true
        }
      }
    }
  })

  res.status(201).json(_parseProductToView(product))
}

export const updateProduct = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { name, description, price, reference, categories, components } =
    req.body as ProductCreationRequest

  const productId = parseInt(id)

  const productData: any = {
    name,
    description,
    price,
    reference
  }

  if (categories !== undefined) {
    await ctx.prisma.productCategory.deleteMany({
      where: { productId }
    })

    if (categories !== null) {
      productData.ProductCategories = {
        create: categories.map(categoryId => ({ category: categoryId }))
      }
    }
  }

  if (components !== undefined) {
    if (components.find(c => c.productId === parseInt(id)) !== undefined) {
      throw new RequestError(400, 'Product cannot be a component of itself')
    }

    await ctx.prisma.productComponent.deleteMany({
      where: { parentId: productId }
    })

    if (components !== null) {
      productData.ProductComponents = {
        create: components.map(component => ({
          childProduct: component.productId,
          quantity: component.quantity
        }))
      }
    }
  }

  const product = await ctx.prisma.product.update({
    where: { id: productId },
    data: productData,
    include: {
      ProductCategories: {
        include: {
          Category: true
        }
      },
      ProductComponents: {
        include: {
          Child: true
        }
      }
    }
  })

  res.status(200).json(_parseProductToView(product))
}
