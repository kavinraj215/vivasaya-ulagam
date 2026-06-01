export interface Category {
  id: number;
  name: string;
  emoji: string;
  slug: string;
  bgColor: string;
}

export const categories: Category[] = [
  { id: 1, name: "Hair & Skin Care", emoji: "🧴", slug: "hair-skin-care", bgColor: "from-purple-50 to-pink-100" },
  { id: 2, name: "Rice Powders (சோறு பொடி)", emoji: "🍚", slug: "rice-powders", bgColor: "from-green-50 to-green-100" },
  { id: 3, name: "Thokku & Pickles", emoji: "🫙", slug: "thokku-pickles", bgColor: "from-red-50 to-orange-100" },
  { id: 4, name: "Masala & Spice Powders", emoji: "🌶️", slug: "masala-spice-powders", bgColor: "from-orange-50 to-red-100" },
  { id: 5, name: "Sweets & Snacks", emoji: "🍿", slug: "sweets-snacks", bgColor: "from-amber-50 to-yellow-100" },
  { id: 6, name: "Health & Dairy", emoji: "🥛", slug: "health-dairy", bgColor: "from-blue-50 to-indigo-100" },
];
