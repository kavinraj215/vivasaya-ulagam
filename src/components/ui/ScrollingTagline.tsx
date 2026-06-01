"use client";

export default function ScrollingTagline() {
  const items = [
    "🧪 Pesticides Free",
    "🎖️ Premium Quality",
    "🍃 Direct from Farms",
    "⚡ Pure & Natural",
    "🚚 Fast Delivery",
    "💚 Trusted by 50,000+ Families",
    "🌿 100% Organic",
    "🏆 FSSAI Certified",
    "🤝 Supporting Local Farmers",
    "✨ No Additives",
  ];

  const track = [...items, ...items]; // duplicate for seamless loop

  return (
    <div className="ticker-overflow bg-primary py-3">
      <div className="marquee-track">
        {track.map((item, i) => (
          <span
            key={i}
            className="text-white font-body font-semibold text-sm whitespace-nowrap px-8"
          >
            {item}
            <span className="mx-4 opacity-40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
