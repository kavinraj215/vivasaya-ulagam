"use client";

export default function AnnouncementBar() {
  const items = [
    "🚚 FREE SHIPPING ON ORDERS ABOVE ₹1,000!",
    "🌿 100% ORGANIC & PESTICIDE FREE",
    "🎖️ CERTIFIED PRODUCTS DIRECT FROM FARM",
    "🏆 TRUSTED BY 50,000+ FAMILIES",
    "💚 SUPPORT LOCAL FARMERS",
    "🌿 FREE SHIPPING ON ORDERS ABOVE ₹1,000!",
    "🧪 PESTICIDE FREE · CERTIFIED ORGANIC",
    "🍃 DIRECT FROM TAMIL NADU FARMS",
  ];

  const text = items.join("   ·   ") + "   ·   ";

  return (
    <div
      className="h-[32px] flex items-center overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-primary-dark select-none"
      aria-label="Announcement marquee"
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate for seamless loop */}
        <span className="text-cream font-body text-[11px] font-bold whitespace-nowrap tracking-widest pr-8">
          {text}
        </span>
        <span className="text-cream font-body text-[11px] font-bold whitespace-nowrap tracking-widest pr-8" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
