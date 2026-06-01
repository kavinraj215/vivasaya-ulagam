"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import LargeFeaturedBanners from "@/components/home/LargeFeaturedBanners";
import ShopByVideos from "@/components/home/ShopByVideos";
import NewProducts from "@/components/home/NewProducts";
import ShopByConcern from "@/components/home/ShopByConcern";
import LimitedDeals from "@/components/home/LimitedDeals";
import WhyUs from "@/components/home/WhyUs";
import Certifications from "@/components/home/Certifications";

type HomeSettings = {
  hero_slides?: { image?: string; link?: string; headline?: string; subtitle?: string }[];
  section_hero_enabled?: boolean;
  section_category_grid_enabled?: boolean;
  section_large_featured_banners_enabled?: boolean;
  section_shop_by_videos_enabled?: boolean;
  section_new_products_enabled?: boolean;
  section_shop_by_concern_enabled?: boolean;
  section_limited_deals_enabled?: boolean;
  section_why_us_enabled?: boolean;
  section_certifications_enabled?: boolean;
  section_category_grid_title?: string;
  section_new_products_title?: string;
  section_new_products_subtitle?: string;
  section_limited_deals_title?: string;
  section_limited_deals_subtitle?: string;
  why_choose_title?: string;
  why_choose_subtitle?: string;
  paddingTop?: number;
  paddingBottom?: number;
  section_certifications_title?: string;
  section_certifications_subtitle?: string;
};

export default function HomePage() {
  const [showBackTop, setShowBackTop] = useState(false);
  const [settings, setSettings] = useState<HomeSettings>({});

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = (await res.json()) as { success?: boolean; settings?: HomeSettings };
        if (data.success) {
          setSettings(data.settings || {});
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <Navbar />

      {settings.section_hero_enabled !== false && <HeroBanner settings={settings} />}
      {settings.section_category_grid_enabled !== false && <CategoryGrid settings={settings} />}
      {settings.section_large_featured_banners_enabled !== false && <LargeFeaturedBanners settings={settings} />}
      {settings.section_shop_by_videos_enabled !== false && <ShopByVideos />}
      {settings.section_new_products_enabled !== false && <NewProducts settings={settings} />}
      {settings.section_shop_by_concern_enabled !== false && <ShopByConcern />}
      {settings.section_why_us_enabled !== false && <WhyUs settings={settings} />}
      {settings.section_limited_deals_enabled !== false && <LimitedDeals settings={settings} />}
      {settings.section_certifications_enabled !== false && <Certifications settings={settings} />}

      <Footer />

      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center justify-center text-dark hover:text-primary hover:bg-secondary transition-all duration-300 z-50 fixed shadow-lg cursor-pointer"
            style={{ 
              width: "64px", 
              height: "64px", 
              bottom: "96px", 
              right: "32px", 
              backgroundColor: "var(--color-surface)", 
              border: "1px solid var(--organic-border)",
              borderRadius: "999px"
            }}
          >
            <ArrowUp size={28} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
