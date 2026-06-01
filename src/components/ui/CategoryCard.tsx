"use client";

import Link from "next/link";

export interface CategoryCardData {
  id?: number | string;
  _id?: string;
  name: string;
  emoji: string;
  slug: string;
  bgColor: string;
  image?: string;
}

interface CategoryCardProps {
  category: CategoryCardData;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const fallbackImages: Record<string, string> = {
    "hair-skin-care": "/uploads/products/hair_skin_care_thumb.png",
    "rice-powders": "/uploads/products/rice_powders_thumb.png",
    "thokku-pickles": "/uploads/products/thokku_pickles_thumb.png",
    "masala-spice-powders": "/uploads/products/masala_spice_powders_thumb.png",
    "sweets-snacks": "/uploads/products/sweets_snacks_thumb.png",
    "health-dairy": "/uploads/products/health_dairy_thumb.png",
  };
  const image = category.image || fallbackImages[category.slug];

  return (
    <Link
      href={`/categories?category=${category.slug}`}
      className="group flex w-full flex-col items-center cursor-pointer snap-start"
      aria-label={`Shop ${category.name}`}
    >
      <div
        className="w-[136px] h-[136px] sm:w-[154px] sm:h-[154px] lg:w-[170px] lg:h-[170px] rounded-full bg-[#f5f5f5] flex items-center justify-center text-4xl sm:text-5xl shadow-none relative overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-1"
      >
        {image ? (
          <img
            src={image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <span className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-[1.08]">
            {category.emoji}
          </span>
        )}
      </div>

      <span className="font-heading font-semibold text-[15px] sm:text-[16px] text-[#222222] text-center leading-[1.35] mt-[18px] max-w-[12rem] transition-colors duration-300 group-hover:text-primary">
        {category.name}
      </span>
    </Link>
  );
}
