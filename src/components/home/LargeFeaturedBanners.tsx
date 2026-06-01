"use client";

import Link from "next/link";

type FeaturedBannerSettings = {
  promo_left_link?: string;
  promo_right_link?: string;
  promo_left_image?: string;
  promo_right_image?: string;
  promo_left_title?: string;
  promo_right_title?: string;
};

export default function LargeFeaturedBanners({ settings }: { settings?: FeaturedBannerSettings }) {
  const leftLink = settings?.promo_left_link && settings.promo_left_link !== "#" ? settings.promo_left_link : "/shop";
  const rightLink = settings?.promo_right_link && settings.promo_right_link !== "#" ? settings.promo_right_link : "/shop";
  const leftImage = settings?.promo_left_image || "/millet-noodles-banner.png";
  const rightImage = settings?.promo_right_image || "/tea-infusion-banner.png";

  return (
    <section className="w-full bg-white font-body pb-[44px]">
      <div className="mx-auto grid w-full max-w-[1170px] grid-cols-1 items-center justify-center gap-[30px] px-[15px] md:grid-cols-2">
        <Link
          href={leftLink}
          className="group relative block h-[132px] w-full cursor-pointer overflow-hidden bg-[#f5f5f5] transition-opacity duration-300 hover:opacity-95 sm:h-[190px]"
          aria-label="Shop Millet Noodles Combo"
        >
          <img
            src={leftImage}
            alt={settings?.promo_left_title || "Millet noodles banner"}
            className="h-full w-full object-cover object-center"
          />
        </Link>

        <Link
          href={rightLink}
          className="group relative block h-[132px] w-full cursor-pointer overflow-hidden bg-[#f5f5f5] transition-opacity duration-300 hover:opacity-95 sm:h-[190px]"
          aria-label="Shop Tea Infusion"
        >
          <img
            src={rightImage}
            alt={settings?.promo_right_title || "Tea infusion banner"}
            className="h-full w-full object-cover object-center"
          />
        </Link>
      </div>
    </section>
  );
}
