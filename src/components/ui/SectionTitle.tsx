"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  leafDecorator?: boolean;
  children?: ReactNode;
}

export default function SectionTitle({
  title,
  subtitle,
  center = true,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`mb-[32px] ${center ? "text-center" : ""}`}
    >
      <h2 className={`font-heading text-[22px] font-bold leading-[1.35] text-[#222222] ${center ? "inline-block" : ""}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-[1.7] text-[#777777]">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
