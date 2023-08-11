import {
  type Category,
  Prisma,
  type Product,
  type ProductCategory,
  type ProductComponent
} from '@prisma/client'

export const mockCategory: Category = {
  id: 1,
  name: 'test',
  description: 'test'
}

type JoinedProduct = Product & {
  ProductComponents: Array<ProductComponent & { Child: Product }>
  ProductCategories: Array<ProductCategory & { Category: Category }>
}

export const mockProductsArray: JoinedProduct[] = [
  {
    id: 5,
    name: 'Product 1',
    description: 'Product 1 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    reference: '00000',
    createdAt: new Date('2023-08-09T11:08:36.434Z'),
    updatedAt: new Date('2023-08-09T11:08:36.434Z'),
    active: true,
    ProductCategories: [],
    ProductComponents: []
  },
  {
    id: 6,
    name: 'Product 2',
    description: 'Product 2 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    reference: '00001',
    createdAt: new Date('2023-08-09T11:09:10.524Z'),
    updatedAt: new Date('2023-08-09T11:09:10.524Z'),
    active: true,
    ProductCategories: [],
    ProductComponents: [
      {
        id: 1,
        parentId: 6,
        childId: 5,
        quantity: 2,
        Child: {
          id: 5,
          name: 'Product 1',
          description: 'Product 1 description',
          price: new Prisma.Decimal(10.99),
          image: null,
          reference: '00000',
          createdAt: new Date('2023-08-09T11:08:36.434Z'),
          updatedAt: new Date('2023-08-09T11:08:36.434Z'),
          active: true
        }
      }
    ]
  },
  {
    id: 7,
    name: 'Product 3',
    description: 'Product 3 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    reference: '00002',
    createdAt: new Date('2023-08-09T11:11:56.436Z'),
    updatedAt: new Date('2023-08-09T11:11:56.436Z'),
    active: true,
    ProductCategories: [
      {
        id: 5,
        productId: 7,
        categoryId: 1,
        Category: {
          id: 1,
          name: 'Category 1',
          description: 'Category 1 description'
        }
      }
    ],
    ProductComponents: [
      {
        id: 2,
        parentId: 7,
        childId: 6,
        quantity: 5,
        Child: {
          id: 6,
          name: 'Product 2',
          description: 'Product 2 description',
          price: new Prisma.Decimal(10.99),
          image: null,
          reference: '00001',
          createdAt: new Date('2023-08-09T11:09:10.524Z'),
          updatedAt: new Date('2023-08-09T11:09:10.524Z'),
          active: true
        }
      }
    ]
  }
]

type ProductParsed = Product & {
  categories: Category[]
  components: Array<{ quantity: number; product: Product }>
  ProductCategories: Array<ProductCategory & { Category: Category }> | undefined
  ProductComponents: Array<ProductComponent & { Child: Product }> | undefined
}

export const mockProductsParsedArray: ProductParsed[] = [
  {
    id: 5,
    name: 'Product 1',
    description: 'Product 1 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    createdAt: new Date('2023-08-09T11:08:36.434Z'),
    updatedAt: new Date('2023-08-09T11:08:36.434Z'),
    active: true,
    reference: '00000',
    categories: [],
    components: [],
    ProductCategories: undefined,
    ProductComponents: undefined
  },
  {
    id: 6,
    name: 'Product 2',
    description: 'Product 2 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    createdAt: new Date('2023-08-09T11:09:10.524Z'),
    updatedAt: new Date('2023-08-09T11:09:10.524Z'),
    active: true,
    reference: '00001',
    categories: [],
    components: [
      {
        quantity: 2,
        product: {
          id: 5,
          name: 'Product 1',
          description: 'Product 1 description',
          price: new Prisma.Decimal(10.99),
          image: null,
          reference: '00000',
          createdAt: new Date('2023-08-09T11:08:36.434Z'),
          updatedAt: new Date('2023-08-09T11:08:36.434Z'),
          active: true
        }
      }
    ],
    ProductCategories: undefined,
    ProductComponents: undefined
  },
  {
    id: 7,
    name: 'Product 3',
    description: 'Product 3 description',
    price: new Prisma.Decimal(10.99),
    image: null,
    createdAt: new Date('2023-08-09T11:11:56.436Z'),
    updatedAt: new Date('2023-08-09T11:11:56.436Z'),
    active: true,
    reference: '00002',
    categories: [
      {
        id: 1,
        name: 'Category 1',
        description: 'Category 1 description'
      }
    ],
    components: [
      {
        quantity: 5,
        product: {
          id: 6,
          name: 'Product 2',
          description: 'Product 2 description',
          price: new Prisma.Decimal(10.99),
          image: null,
          reference: '00001',
          createdAt: new Date('2023-08-09T11:09:10.524Z'),
          updatedAt: new Date('2023-08-09T11:09:10.524Z'),
          active: true
        }
      }
    ],
    ProductCategories: undefined,
    ProductComponents: undefined
  }
]

export const mockProductCategory: ProductCategory = {
  id: 1,
  productId: 1,
  categoryId: 1
}
