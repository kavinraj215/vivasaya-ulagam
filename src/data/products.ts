export interface Product {
  id: number | string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  category: string;
  categories?: string[];
  emoji: string;
  bgColor: string;
  isNew: boolean;
  isBestSeller: boolean;
  image?: string;
  images?: string[];
  description?: string;
  weight?: number;
  weightUnit?: string;
  variants?: { type: string; value: string; price?: number; additionalPrice?: number; stock?: number }[];
}

export const products: Product[] = [];

export const newProducts: Product[] = [];
export const bestSellers: Product[] = [];
export const limitedDeals: Product[] = [];
export const honeyProducts: Product[] = [];
