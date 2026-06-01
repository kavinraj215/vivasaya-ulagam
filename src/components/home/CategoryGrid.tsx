"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/data/categories";
import CategoryCard, { CategoryCardData } from "@/components/ui/CategoryCard";

// Helper to chunk the categories array into pages
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

type CategoryGridSettings = {
  section_category_grid_title?: string;
};

type CategoryApiResponse = {
  success?: boolean;
  categories?: (CategoryCardData & { isVisible?: boolean })[];
};

const mergeWithFallbackCategories = (dbCategories: CategoryCardData[]) => {
  if (dbCategories.length >= 6) return dbCategories;

  const seen = new Set(dbCategories.map((category) => category.slug));
  const fallback = categories.filter((category) => !seen.has(category.slug));
  return [...dbCategories, ...fallback];
};

export default function CategoryGrid({ settings }: { settings?: CategoryGridSettings }) {
  const [page, setPage] = useState(0);
  const [dbCategories, setDbCategories] = useState<CategoryCardData[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = (await res.json()) as CategoryApiResponse;
        const visibleCategories = data.categories?.filter((category) => category.isVisible !== false) ?? [];
        if (data.success && visibleCategories.length > 0) {
          setDbCategories(visibleCategories);
        }
      } catch (err) {
        console.error("Failed to fetch database categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const activeCategories: CategoryCardData[] =
    dbCategories.length > 0 ? mergeWithFallbackCategories(dbCategories) : categories;
  const pages = chunkArray(activeCategories, 6);
  const currentPage = page < pages.length ? page : 0;

  if (pages.length === 0) return null;

  return (
    <section
      id="categories"
      className="w-full bg-white overflow-hidden font-body"
    >
      <div className="vivasaya-container flex flex-col pt-[52px] pb-[45px]">
        <div className="text-center mb-[31px]">
          <h2 className="vivasaya-section-title uppercase">
            {settings?.section_category_grid_title || "TASTE THE DIFFERENCE"}
          </h2>
        </div>

        <div 
          className="relative w-full max-w-[1200px] mx-auto flex items-center justify-center h-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: "easeOut", staggerChildren: 0.1 }}
              className="grid grid-cols-3 lg:grid-cols-6 gap-x-[25px] gap-y-7 w-full justify-items-center"
            >
              {pages[currentPage].map((cat, i) => (
                <motion.div
                  key={cat.id || cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="flex-shrink-0"
                >
                  <CategoryCard category={cat} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-[28px]">
          <div className="flex items-center gap-[9px]">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-[7px] rounded-full transition-all duration-300 ease-out ${
                  page === idx 
                    ? "w-[30px] bg-[#222222]" 
                    : "w-[7px] bg-[#9b9b9b] hover:bg-[#666666]"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
