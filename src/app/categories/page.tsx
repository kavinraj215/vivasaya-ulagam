"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, Grid, Loader2 } from "lucide-react";
import { categories } from "@/data/categories";
import { products as staticProducts, Product } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";

type DbCategory = {
  id?: number | string;
  _id?: string;
  name: string;
  slug?: string;
  emoji?: string;
  bgColor?: string;
  isVisible?: boolean;
};

type DbProduct = {
  _id: string | { toString: () => string };
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

type CategorySettings = {
  categories_banner_enabled?: boolean;
  categories_banner_image?: string;
  categories_banner_title?: string;
  categories_banner_subtitle?: string;
};

// Helper to map DB categories/names to matching aesthetic emojis/backgrounds
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

export default function CategoriesPage() {
  const [settings, setSettings] = useState<CategorySettings>({});
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [selectedCat, setSelectedCat] = useState("Hair & Skin Care");

  // Fetch db categories
  useEffect(() => {
    async function loadDbCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = (await res.json()) as { success?: boolean; categories?: DbCategory[] };
        const visibleCats = data.categories?.filter((category) => category.isVisible !== false) ?? [];
        if (data.success && visibleCats.length > 0) {
          setDbCategories(visibleCats);
          // If the default selectedCat is not in active categories, set it to the first active category
          if (visibleCats.length > 0) {
            const hasDefault = visibleCats.some(c => c.name.toLowerCase() === "hair & skin care");
            if (!hasDefault) {
              setSelectedCat(visibleCats[0].name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load DB categories:", err);
      }
    }
    loadDbCategories();
  }, []);

  const activeCategories: DbCategory[] = dbCategories.length > 0 ? dbCategories : categories;

  // Read URL query parameter for category on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        const found = activeCategories.find(
          c => c.name.toLowerCase() === catParam.toLowerCase() || c.slug?.toLowerCase() === catParam.toLowerCase()
        );
        if (found && found.name !== selectedCat) {
          const timer = window.setTimeout(() => setSelectedCat(found.name), 0);
          return () => window.clearTimeout(timer);
        }
      }
    }
  }, [activeCategories, selectedCat]);

  // 1. Fetch settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = (await res.json()) as { success?: boolean; settings?: CategorySettings };
        if (data.success) {
          setSettings(data.settings || {});
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 2. Fetch live products and map them
  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        const data = (await res.json()) as { success?: boolean; products?: DbProduct[] };
        const apiProducts = data.products ?? [];
        if (data.success && apiProducts.length > 0) {
          const activeDbProds = apiProducts
            .filter((p) => p.status === "active")
            .map((p) => {
              const compareAtPrice = p.compareAtPrice ?? p.price * 1.25;
              const aesthetics = getEmojiAndBg(p.title, p.category || "");
              const disc = compareAtPrice > p.price
                ? Math.round(((compareAtPrice - p.price) / compareAtPrice) * 100)
                : 0;

              return {
                id: p._id.toString(),
                name: p.title,
                originalPrice: compareAtPrice,
                salePrice: p.price,
                discount: disc || 20,
                rating: p.rating || 4.7,
                reviewCount: p.reviewCount || 8,
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
          setDbProducts(activeDbProds);
        }
      } catch (err) {
        console.error("Failed to load live database products:", err);
      } finally {
        setLoadingProds(false);
      }
    }
    loadLiveProducts();
  }, []);

  // Combine database products with static fallback products
  const combinedProducts = [...dbProducts, ...staticProducts];

  // Animation settings for premium fade-in-up effects
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] flex flex-col font-body text-[#1A1A1A]">
      <Navbar />

      <main className="flex-grow pt-[calc(var(--navbar-height)+1rem)] pb-24">

        <div className="max-w-[1320px] mx-auto w-full px-8 py-6">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={10} className="stroke-[3]" />
            <span className="text-gray-600">All Categories</span>
          </nav>

          {/* Interactive Categories Catalog Split Layout */}
          {loadingProds ? (
            <div className="w-full py-24 bg-white border border-[#ECECEC] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.06)] rounded-[22px] flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading categories catalog...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-[28px] items-start">

              {/* Left Sidebar Index for Desktop */}
              <aside className="hidden md:block w-[290px] shrink-0 bg-white border border-[#ECECEC] rounded-[20px] p-[18px] sticky top-[calc(var(--navbar-height)+1rem)] select-none">
                <h3 className="font-heading font-bold text-[11px] uppercase tracking-wider text-[#6B7280] mb-4 px-3">
                  Select Category
                </h3>
                <nav className="flex flex-col gap-1.5" aria-label="Categories Sidebar">
                  {activeCategories.map((cat) => {
                    const isActive = selectedCat.toLowerCase() === cat.name.toLowerCase();
                    const keyVal = cat._id || cat.id || cat.slug;
                    return (
                      <button
                        key={keyVal}
                        onClick={() => setSelectedCat(cat.name)}
                        className={`w-full text-left px-4 h-[56px] rounded-[14px] text-xs transition-all duration-250 ease-out flex items-center justify-between group cursor-pointer ${isActive
                            ? "bg-[#1F6B3B] text-white font-semibold shadow-[0_6px_18px_rgba(31,107,59,0.16)]"
                            : "bg-transparent text-[#222222] hover:bg-[#F6F8F6]"
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base select-none">{cat.emoji}</span>
                          <span>{cat.name}</span>
                        </span>
                        <ChevronRight
                          size={13}
                          className={`transition-transform duration-250 ${isActive ? "text-white" : "text-gray-300 group-hover:text-primary group-hover:translate-x-0.5"
                            }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Horizontal Scroll Selector for Mobile */}
              <div className="w-full md:hidden bg-white border border-[#ECECEC] py-3 px-4 sticky top-[calc(var(--navbar-height)+0.5rem)] z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none rounded-[18px] mb-4">
                <div className="flex overflow-x-auto hide-scrollbar gap-4 py-1 scroll-smooth">
                  {activeCategories.map((cat) => {
                    const isActive = selectedCat.toLowerCase() === cat.name.toLowerCase();
                    const keyVal = cat._id || cat.id || cat.slug;
                    return (
                      <button
                        key={keyVal}
                        onClick={() => setSelectedCat(cat.name)}
                        className={`whitespace-nowrap px-3.5 py-2 text-xs transition-all border outline-none cursor-pointer rounded-[14px] ${isActive
                            ? "border-[#1F6B3B] bg-[#1F6B3B] text-white font-bold"
                            : "border-gray-200 text-gray-500 hover:text-gray-800 bg-[#FAF9F5]/40"
                          }`}
                      >
                        <span className="mr-1.5">{cat.emoji}</span>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Side / Mobile Bottom Product Catalog Grid */}
              <div className="flex-grow w-full flex flex-col gap-6">

                {/* Active Category Header */}
                {(() => {
                  const activeCategoryData = activeCategories.find(c => c.name.toLowerCase() === selectedCat.toLowerCase()) || activeCategories[0];
                  const activeCategoryProducts = combinedProducts.filter((p) => {
                    const matchesCategory = p.category?.toLowerCase() === activeCategoryData.name.toLowerCase();
                    const matchesCategories = p.categories?.some(
                      (c: string) => c.toLowerCase() === activeCategoryData.name.toLowerCase()
                    );
                    return matchesCategory || matchesCategories;
                  });
                  return (
                    <>
                      <div className="bg-white border border-[#ECECEC] h-[78px] px-[28px] rounded-[18px] flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl select-none">{activeCategoryData.emoji}</span>
                          <h2 className="font-heading font-bold text-xl md:text-[30px] text-[#1A1A1A] tracking-tight">
                            {activeCategoryData.name}
                          </h2>
                        </div>
                        <span className="text-[14px] text-[#9CA3AF] font-semibold">
                          {activeCategoryProducts.length} Items Found
                        </span>
                      </div>

                      {/* Product Catalog Grid wrapped in ProductSection */}
                      <div className="bg-white rounded-[22px] border border-[#ECECEC] p-8 min-h-[420px]">
                        {activeCategoryProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center text-[#9CA3AF]">
                            <Grid size={56} className="mb-4 text-[#9CA3AF]" />
                            <p className="text-[18px] font-semibold">No products found in this category</p>
                          </div>
                        ) : (
                          <motion.div
                            key={selectedCat}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                          >
                            {activeCategoryProducts.map((product) => (
                              <motion.div
                                key={product.id}
                                variants={columnVariants}
                                className="shadow-[0_4px_14px_rgba(0,0,0,0.04)] rounded-[18px] overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-[250ms] ease-out bg-white h-full"
                              >
                                <ProductCard product={product} />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </>
                  );
                })()}

              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
