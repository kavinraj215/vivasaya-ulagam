"use client";

interface BadgeProps {
  text: string;
  variant?: "green" | "red" | "amber" | "blue";
  size?: "sm" | "md";
}

const variantMap = {
  green: "bg-primary text-white",
  red: "bg-red-500 text-white",
  amber: "bg-accent text-white",
  blue: "bg-blue-500 text-white",
};

export default function Badge({ text, variant = "green", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-heading font-bold tracking-wide
        ${variantMap[variant]}
        ${size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"}
      `}
    >
      {text}
    </span>
  );
}
