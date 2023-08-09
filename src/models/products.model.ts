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
