export interface CategoryCreationRequest {
  name: string
  description: string
}

export interface ProductCreationRequest {
  name: string
  description: string
  price: number
  stock: number
  reference: string
  categories: number[]
  components: Array<{ productId: number; quantity: number }>
}

export interface ProductResponse {
  id: number
  name: string
  description: string
  price: number
  reference: string
  createdAt: Date
  updatedAt: Date
  categories: CategoryResponse[]
  components: ProductComponent[]
}

export interface CategoryResponse {
  id: number
  name: string
  description: string
}

export type ProductComponent = Omit<
  ProductResponse,
  'categories' | 'components'
> & {
  quantity: number
}
