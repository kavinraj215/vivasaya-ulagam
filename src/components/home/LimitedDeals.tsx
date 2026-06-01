"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { limitedDeals } from "@/data/products";
import Link from "next/link";

const DEAL_TARGET = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

function useCountdown() {
  const [time, setTime] = useState({ days: 2, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = DEAL_TARGET.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTime({ days, hours, mins, secs });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

type LimitedDealsSettings = {
  section_limited_deals_title?: string;
  section_limited_deals_subtitle?: string;
};

export default function LimitedDeals({ settings }: { settings?: LimitedDealsSettings }) {
  const { days, hours, mins, secs } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="limited-deals" className="bg-white py-[44px]">
      <div className="vivasaya-product-container">
        <div className="mb-[32px] flex flex-col items-center justify-between gap-5 text-center md:flex-row md:items-end md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
              <Clock size={15} className="text-primary" />
              <span className="text-[12px] font-semibold uppercase tracking-normal text-primary">
                {settings?.section_limited_deals_subtitle || "Flash Sale"}
              </span>
            </div>
            <h2 className="font-heading text-[22px] font-bold leading-[1.35] text-[#222222] sm:text-[24px]">
              {settings?.section_limited_deals_title || "Limited Time Deals! Grab now"}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {[
              { label: "Days", val: pad(days) },
              { label: "Hours", val: pad(hours) },
              { label: "Mins", val: pad(mins) },
              { label: "Secs", val: pad(secs) },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#dddddd] bg-white sm:h-14 sm:w-14">
                    <span className="font-heading text-lg font-bold text-primary sm:text-xl">{item.val}</span>
                  </div>
                  <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#777777]">
                    {item.label}
                  </span>
                </div>
                {i < 3 && <span className="-mt-4 text-xl font-bold text-[#dddddd]">:</span>}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="-mt-[30px] grid grid-cols-2 md:grid-cols-4">
          {limitedDeals.map((product) => (
            <div key={product.id} className="px-[7.5px] pt-[30px] md:px-[15px]">
              <ProductCard product={product} urgency="Ends in 2 Days" />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="inline-flex items-center gap-2 btn-outline px-7" aria-label="View all deals">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
