"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const subBanners = [
  {
    id: 1,
    label: "Millet Noodles",
    tagline: "Healthy & Delicious",
    emoji: "🍜",
    bg: "from-[#1b4332] to-[#52b788]",
    textColor: "text-white",
    link: "/shop?category=Rice Powders (சோறு பொடி)",
  },
  {
    id: 2,
    label: "Organic Pasta",
    tagline: "Italian Taste, Indian Heart",
    emoji: "🍝",
    bg: "from-[#92400e] to-[#f4a261]",
    textColor: "text-white",
    link: "/shop?category=Rice Powders (சோறு பொடி)",
  },
  {
    id: 3,
    label: "Millet Vermicelli",
    tagline: "Traditional Goodness",
    emoji: "🌾",
    bg: "from-[#0f766e] to-[#2dd4bf]",
    textColor: "text-white",
    link: "/shop?category=Rice Powders (சோறு பொடி)",
  },
];

export default function FeaturedBanners({ settings }: { settings?: any }) {
  const bannersList = (settings?.featured_banners && settings.featured_banners.length > 0)
    ? settings.featured_banners
    : subBanners;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="featured-banners">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bannersList.map((banner: any, i: number) => {
          const destination = banner.link && banner.link !== "#" ? banner.link : "/shop";
          return (
            <Link
              key={banner.id}
              href={destination}
              className="relative h-[200px] rounded-2xl overflow-hidden block cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              aria-label={`Shop ${banner.label}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                style={banner.image ? { backgroundImage: `url(${banner.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                className={`w-full h-full relative bg-gradient-to-br ${banner.bg || "from-green-800 to-green-600"} bg-cover bg-center`}
              >
                {/* Background Image Overlay */}
                {banner.image && (
                  <div className="absolute inset-0 bg-black/35 pointer-events-none" />
                )}

                {/* Background emoji large */}
                {!banner.image && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[90px] opacity-20 select-none">
                    {banner.emoji}
                  </span>
                )}

                {/* Content bottom-left */}
                <div className="absolute bottom-4 left-5">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                    {banner.tagline}
                  </p>
                  <h3 className="text-white font-heading font-bold text-xl leading-tight mb-2">
                    {banner.label}
                  </h3>
                  <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                    Shop Now <ArrowRight size={14} />
                  </div>
                </div>

                {/* Emoji foreground */}
                <span className="absolute top-4 right-4 text-4xl select-none">
                  {banner.emoji}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
