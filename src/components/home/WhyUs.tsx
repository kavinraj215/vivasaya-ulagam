"use client";

import { motion } from "framer-motion";
import { Leaf, Globe, ShieldCheck, FlaskConical } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const reasons = [
  {
    Icon: Leaf,
    iconColor: "text-primary",
    iconBg: "bg-primary/5 group-hover:bg-primary/12",
    title: "High Nutritional Value",
    desc: "Organic foods preserve far more natural vitamins and minerals than conventional produce.",
  },
  {
    Icon: Globe,
    iconColor: "text-primary",
    iconBg: "bg-primary/5 group-hover:bg-primary/12",
    title: "Preserves the Environment",
    desc: "Sustainable farming ensures soil conservation, biodiversity & reduced air pollution.",
  },
  {
    Icon: ShieldCheck,
    iconColor: "text-primary",
    iconBg: "bg-primary/5 group-hover:bg-primary/12",
    title: "Certified Organic Sources",
    desc: "Strictly quality controlled and independently verified by FSSAI and NPOP authorities.",
  },
  {
    Icon: FlaskConical,
    iconColor: "text-primary",
    iconBg: "bg-primary/5 group-hover:bg-primary/12",
    title: "No Chemicals & Pesticides",
    desc: "Zero artificial fertilisers, additives, or harmful chemicals in any of our products.",
  },
];

type WhyUsSettings = {
  why_choose_title?: string;
  why_choose_subtitle?: string;
  paddingTop?: number;
  paddingBottom?: number;
};

export default function WhyUs({ settings }: { settings?: WhyUsSettings }) {
  const currentTitle = settings?.why_choose_title || "Why Vivasaya Ulagam?";
  const currentSubtitle = settings?.why_choose_subtitle || "We believe in food that is good for you and good for the planet.";

  return (
    <section 
      id="why-us" 
      className="bg-white transition-all duration-300"
      style={{
        paddingTop: settings?.paddingTop ? `${settings.paddingTop}px` : undefined,
        paddingBottom: settings?.paddingBottom ? `${settings.paddingBottom}px` : undefined,
      }}
    >
      <div className="vivasaya-container py-[44px]">
        <SectionTitle
          title={currentTitle}
          subtitle={currentSubtitle}
          leafDecorator
        />

        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{ y: -3 }}
              className="group flex flex-col items-center gap-3 bg-white p-5 text-center transition-all duration-300"
            >
              {/* Icon circle */}
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#f5f5f5] transition-all duration-300 group-hover:bg-primary/10">
                <reason.Icon
                  size={28}
                  strokeWidth={1.75}
                  className="text-primary transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="font-heading text-[16px] font-semibold leading-[1.35] text-[#222222]">
                {reason.title}
              </h3>
              <p className="font-body text-[14px] leading-[1.7] text-[#777777]">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
