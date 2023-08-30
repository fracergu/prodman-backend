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
  const search = req.query.search as string
  const whereCriteria: any = {}

  if (isValidString(search)) {
    whereCriteria.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }
  const categories = await ctx.prisma.category.findMany({
    where: whereCriteria
  })
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
  await ctx.prisma.productCategory.deleteMany({
    where: { categoryId: parseInt(id) }
  })
  await ctx.prisma.category.delete({
    where: { id: parseInt(id) }
  })
  res.status(200).send()
}

function _parseProductToView(product: any) {
  return {
    ...product,
    categories: product.productCategories.map(
      (pc: { category: any }) => pc.category
    ),
    components: product.productComponents.map(
      (pc: { quantity: any; child: any }) => ({
        quantity: pc.quantity,
        product: pc.child
      })
    ),
    productCategories: undefined,
    productComponents: undefined
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
  const inactive = req.query.inactive as string

  const whereCriteria: any = {}
  if (isValidString(search)) {
    whereCriteria.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (isValidString(category)) {
    whereCriteria.productCategories = {
      some: {
        categoryId: parseInt(category)
      }
    }
  }
  if (isValidString(inactive)) {
    whereCriteria.active = !(inactive === 'true')
  } else {
    whereCriteria.active = true
  }

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

  const [count, products] = await ctx.prisma.$transaction([
    ctx.prisma.product.count({ where: whereCriteria }),
    ctx.prisma.product.findMany({
      take: limit + 1,
      skip: (page - 1) * limit,
      include,
      where: whereCriteria
    })
  ])

  const hasNextPage = products.length > limit
  if (hasNextPage) {
    products.pop()
  }

  const transformedProducts = products.map(_parseProductToView)

  res.status(200).json({
    data: transformedProducts,
    total: count,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
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
      ? categories.map(c => ({
          categoryId: c
        }))
      : undefined

  const productComponents =
    components !== undefined
      ? components.map(component => ({
          childId: component.productId,
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
    productData.productCategories = {
      create: productCategories
    }
  }

  if (productComponents != null) {
    productData.productComponents = {
      create: productComponents
    }
  }

  const product = await ctx.prisma.product.create({
    data: productData,
    include: {
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
      productData.productCategories = {
        create: categories.map(categoryId => ({ categoryId }))
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
      productData.productComponents = {
        create: components.map(component => ({
          childId: component.productId,
          quantity: component.quantity
        }))
      }
    }
  }

  const product = await ctx.prisma.product.update({
    where: { id: productId },
    data: productData,
    include: {
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
  })

  res.status(200).json(_parseProductToView(product))
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const productId = parseInt(id)

  await ctx.prisma.productCategory.deleteMany({
    where: { productId }
  })
  await ctx.prisma.productComponent.deleteMany({
    where: { parentId: productId }
  })
  await ctx.prisma.productComponent.deleteMany({
    where: { childId: productId }
  })
  await ctx.prisma.product.delete({
    where: { id: productId }
  })
  res.status(200).send()
}
