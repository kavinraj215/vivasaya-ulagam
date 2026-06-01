"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* eslint-disable @next/next/no-img-element */

type HeroSlide = {
  image?: string;
  link?: string;
  headline?: string;
  subtitle?: string;
};

type HeroSettings = {
  hero_slides?: HeroSlide[];
};

export default function HeroBanner({ settings }: { settings?: HeroSettings }) {
  const sectionRef = useRef<HTMLElement>(null);
  const slide = settings?.hero_slides?.[0] || {};
  const bannerImage = slide.image || "/banner.jpg";
  const bannerLink = slide.link || "/shop";
  const headline =
    slide.headline ||
    "Pure Organic Foods, Direct From Tamil Nadu Farms";
  const subtitle =
    slide.subtitle ||
    "Traditional staples, cold-pressed oils, native grains, and clean pantry essentials for everyday wholesome cooking.";

  return (
    <section
      ref={sectionRef}
      className="hero-banner-container relative w-full overflow-hidden bg-white h-[620px] sm:h-[360px] lg:h-[356px]"
      aria-label={headline}
    >
      <Link href={bannerLink} className="absolute inset-0 block" aria-label="Shop hero banner">
        <motion.img
          src={bannerImage}
          alt={headline}
          className="h-full w-full object-cover object-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            opacity: { duration: 0.8, ease: "easeOut" },
          }}
        />
      </Link>
      <div className="sr-only">
        <h1>{headline}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
