"use client";

import { useState, useEffect } from "react";
import ProductGrid from "@/components/home/ProductGrid";
import { newProducts, Product } from "@/data/products";

type ProductApiItem = {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  compareAtPrice?: number;
  price: number;
  rating?: number;
  reviewCount?: number;
  collections?: string[];
  images?: string[];
  status?: string;
  weight?: number;
  weightUnit?: string;
};

type ProductApiResponse = {
  success?: boolean;
  products?: ProductApiItem[];
};

type NewProductsSettings = {
  section_new_products_title?: string;
  section_new_products_subtitle?: string;
};

const getEmojiAndBg = (title: string, category: string) => {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();
  
  if (cat.includes("noodle") || cat.includes("pasta") || t.includes("noodle")) {
    return { emoji: "🍜", bgColor: "from-emerald-100 to-green-200" };
  }
  if (cat.includes("honey") || t.includes("honey")) {
    return { emoji: "🍯", bgColor: "from-amber-100 to-yellow-200" };
  }
  if (cat.includes("sweet") || cat.includes("jaggery") || t.includes("jaggery") || t.includes("sugar")) {
    return { emoji: "🌿", bgColor: "from-orange-100 to-amber-200" };
  }
  if (cat.includes("millet") || cat.includes("grain") || cat.includes("rice") || t.includes("millet") || t.includes("rice") || cat.includes("seed")) {
    return { emoji: "🌾", bgColor: "from-lime-100 to-green-200" };
  }
  if (cat.includes("oil") || cat.includes("ghee") || t.includes("oil") || t.includes("ghee")) {
    return { emoji: "🥛", bgColor: "from-yellow-100 to-amber-200" };
  }
  if (cat.includes("tea") || cat.includes("herbal") || t.includes("tea")) {
    return { emoji: "🍵", bgColor: "from-green-100 to-emerald-200" };
  }
  return { emoji: "📦", bgColor: "from-gray-100 to-green-50" };
};

export default function NewProducts({ settings }: { settings?: NewProductsSettings }) {
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        const data = (await res.json()) as ProductApiResponse;
        const apiProducts = data.products ?? [];
        if (data.success && apiProducts.length > 0) {
          // Filter only active status products
          const activeDbProds = apiProducts.filter((p) => p.status === "active");
          
          const mapped: Product[] = activeDbProds.map((p) => {
            const compareAtPrice = p.compareAtPrice ?? p.price * 1.25;
            const aesthetics = getEmojiAndBg(p.title, p.category || "");
            const disc = compareAtPrice > p.price
              ? Math.round(((compareAtPrice - p.price) / compareAtPrice) * 100)
              : 0;

            return {
              id: p._id,
              name: p.title,
              originalPrice: compareAtPrice,
              salePrice: p.price,
              discount: disc || 20,
              rating: p.rating || 4.7,
              reviewCount: p.reviewCount || 12,
              category: p.category || "Organic Goods",
              categories: p.categories || [],
              emoji: aesthetics.emoji,
              bgColor: aesthetics.bgColor,
              isNew: true,
              isBestSeller: p.collections?.includes("Best Sellers") || false,
              image: p.images && p.images.length > 0 ? p.images[0] : undefined,
              weight: p.weight || 0,
              weightUnit: p.weightUnit || "kg",
            };
          });
          setLiveProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load live database products:", err);
      }
    }
    loadLiveProducts();
  }, []);

  // Display DB products first, followed by static ones to guarantee newly added products show up immediately!
  const combinedProducts = [...liveProducts, ...newProducts].slice(0, 8);

  return (
    <div className="bg-white pt-[42px] pb-0">
      <div className="text-center mb-0 px-4">
        <h2 className="vivasaya-section-title">
          {settings?.section_new_products_title || "New Products"}
        </h2>
        <p className="vivasaya-section-copy max-w-2xl mx-auto mt-2">
          {settings?.section_new_products_subtitle || "Elevate your health with our organic delights - Shop now and experience the natural difference!"}
        </p>
      </div>
      <ProductGrid
        id="new-products"
        title=""
        subtitle=""
        products={combinedProducts}
      />
    </div>
  );
}
