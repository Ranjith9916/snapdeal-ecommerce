export type CatProduct = {
  id: string
  name: string
  brand: string
  img: string
  price: number
  original: number
  discount: number
  rating: number
  reviews: number
  delivery: string
  badge?: string
  category: string
}

export const categoryProductsMap: Record<string, CatProduct[]> = {}

export function getProductsByCategory(_cat?: string): CatProduct[] {
  return []
}

export function getAllProducts(): CatProduct[] {
  return []
}

export function getProductById(_id?: number | string): CatProduct | undefined {
  return undefined
}
