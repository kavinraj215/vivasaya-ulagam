"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { products as staticProducts, Product } from "@/data/products";
import { Search, X, Loader2 } from "lucide-react";

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

type SearchApiProduct = {
  _id: string;
  title?: string;
  price?: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  categories?: string[];
  collections?: string[];
  images?: string[];
  status?: string;
  weight?: number;
  weightUnit?: string;
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          const activeDbProds = (data.products as SearchApiProduct[]).filter((p) => p.status === "active");
          const mapped = activeDbProds.map((p) => {
            const price = p.price ?? 0;
            const compareAtPrice = p.compareAtPrice ?? price * 1.25;
            const title = p.title || "Organic Product";
            const category = p.category || "Organic Goods";
            const aesthetics = getEmojiAndBg(title, category);
            const disc = compareAtPrice > price 
              ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
              : 0;

            return {
              id: p._id,
              name: title,
              originalPrice: compareAtPrice,
              salePrice: price,
              discount: disc || 20,
              rating: p.rating || 4.7,
              reviewCount: p.reviewCount || 10,
              category,
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
        console.error("Failed to load products for searching:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProducts();
  }, []);

  const allProducts = [...liveProducts, ...staticProducts];

  // Basic search filter
  const searchResults = query
    ? allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.categories?.some(c => c.toLowerCase().includes(query.toLowerCase()))
      )
    : allProducts;

  return (
    <>
      <Navbar />
      <main className="pt-[calc(var(--navbar-height)+1rem)] pb-16 bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mx-auto mb-16 relative">
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-center text-text-dark mb-8">
              What are you looking for?
            </h1>

            <div className="relative flex items-center">
              <div className="absolute left-6 text-gray-400">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for organic noodles, cold pressed oils, pure honey..."
                className="w-full bg-white border border-primary/10 rounded-full py-4 pl-16 pr-12 text-base sm:text-lg font-body outline-none focus:border-primary shadow-card transition-all"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-6 text-gray-400 hover:text-text-dark"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Quick searches */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider mr-2 mt-2">Popular:</span>
              {["Millet Noodles", "Cold Pressed Oil", "Honey", "Jaggery"].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-1.5 bg-white border border-primary/10 rounded-full text-xs font-body hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  {term
                }</button>
              ))}
            </div>
          </div>

          <div className="border-t border-primary/10 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-heading font-bold text-xl text-text-dark">
                {query ? `Search Results for "${query}" (${searchResults.length})` : "Popular Products"}
              </h2>
              {loading && <Loader2 size={16} className="animate-spin text-[#1F6B3B]" />}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {searchResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 inline-block">🔍</span>
                <h3 className="font-heading font-bold text-xl text-text-dark mb-2">No products found</h3>
                <p className="text-text-muted font-body">
                  We couldn&apos;t find anything matching <span className="font-semibold">&quot;{query}&quot;</span>. Try another search term.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="pt-[calc(var(--navbar-height)+1rem)] pb-16 bg-cream min-h-screen flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-primary" />
          </main>
          <Footer />
        </>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
