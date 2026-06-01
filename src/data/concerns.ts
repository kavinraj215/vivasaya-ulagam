export interface Concern {
  id: number;
  name: string;
  emoji: string;
  description: string;
  bgFrom: string;
  bgTo: string;
  slug: string;
}

export const concerns: Concern[] = [
  {
    id: 1,
    name: "Pregnancy Care",
    emoji: "🧡",
    description: "Nutrient-rich organic foods for expecting mothers",
    bgFrom: "#ff9a9e",
    bgTo: "#fecfef",
    slug: "pregnancy-care",
  },
  {
    id: 2,
    name: "Kids Wellness",
    emoji: "🌟",
    description: "Safe, healthy snacks & nutrients for growing children",
    bgFrom: "#a1c4fd",
    bgTo: "#c2e9fb",
    slug: "kids-wellness",
  },
  {
    id: 3,
    name: "Diabetes-Friendly",
    emoji: "🩺",
    description: "Low-GI foods to support healthy blood sugar levels",
    bgFrom: "#84fab0",
    bgTo: "#8fd3f4",
    slug: "diabetes-friendly",
  },
  {
    id: 4,
    name: "High-Protein Essentials",
    emoji: "💪",
    description: "Protein-packed organic produce for active lifestyles",
    bgFrom: "#f093fb",
    bgTo: "#f5576c",
    slug: "high-protein",
  },
];
