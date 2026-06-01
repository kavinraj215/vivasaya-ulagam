"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Thanks for subscribing!");
        setEmail("");
      } else {
        setMsg(data.error || "Failed to subscribe.");
      }
    } catch {
      setMsg("Connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full bg-white/[0.08] border border-white/15 rounded-full px-5 py-3 pr-28 text-sm text-white placeholder-white/50 outline-none focus:border-accent-light/60 transition-all"
          aria-label="Newsletter email"
        />
        <button
          type="submit"
          disabled={submitting}
          className="absolute right-1 top-1 bottom-1 bg-cream text-primary-dark rounded-full px-5 text-sm font-bold hover:bg-white disabled:opacity-60 transition-colors"
          aria-label="Subscribe"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </div>
      {msg && <p className="text-xs text-accent-light font-semibold pl-2">{msg}</p>}
    </form>
  );
}

// Inline SVG brand icons (lucide v1 removed brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

const shopLinks = [
  "Grocery", "Oil & Ghee", "Pure Honey", "Best Selling", "Special Combos", "Store Locator"
];
const infoLinks = [
  "Track Order", "About Us", "Delivery Info", "Privacy Policy", "Terms & Conditions", "Blogs", "Bulk Order"
];

export default function Footer() {
  return (
    <footer className="bg-[linear-gradient(135deg,#17251D_0%,#203B2A_58%,#113F25_100%)] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Contact Us */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-lg mb-5 text-white">
              Contact us
            </h3>
            <ul className="space-y-4 text-sm text-white/80 font-body">
              <li className="flex items-start gap-3">
                <MapPin size={20} strokeWidth={1.75} className="text-accent-light shrink-0 mt-0.5" />
                <span>
                  VIVASAYA ULAGAM AGRI PRODUCTS<br />
                  Tamilnadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} strokeWidth={1.75} className="text-accent-light shrink-0" />
                <a href="mailto:care@vivasayaulagam.com" className="hover:text-white transition-colors">
                  care@vivasayaulagam.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} strokeWidth={1.75} className="text-accent-light shrink-0 mt-0.5" />
                <span>
                  +91 98765 43210<br />
                  <span className="text-xs text-white/60">Timing(9:30AM - 6:30PM)</span>
                </span>
              </li>
            </ul>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
                { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
                { Icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 border border-white/15 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-accent-light/50 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-white">
              Shop
            </h3>
            <ul className="space-y-3.5">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                  className="text-white/75 text-sm font-body hover:text-accent-light transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Information */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-white">
              Information
            </h3>
            <ul className="space-y-3.5">
              {infoLinks.map((link) => {
                let href = "#";
                if (link === "About Us") href = "/about";
                if (link === "Bulk Order" || link === "Contact Us") href = "/contact";
                return (
                  <li key={link}>
                    <a
                      href={href}
                      className="text-white/75 text-sm font-body hover:text-accent-light transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4: Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-6 text-white">
              Newsletter Signup
            </h3>
            <p className="text-white/70 text-sm mb-4 font-body">
              Stay connected. Stay healthy.<br />
              Subscribe now!
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-16 pt-8">
          <h4 className="font-heading font-bold text-lg mb-4 text-white">
            100% secure payment
          </h4>
          <div className="flex flex-wrap gap-2">
             {/* Placeholder for payment method icons */}
             {["VISA", "Mastercard", "Amex", "PayPal", "Shop Pay", "Google Pay", "Razorpay"].map((pay) => (
                <div
                  key={pay}
                  className="bg-white/[0.92] rounded-full px-3 py-1.5 text-[10px] font-bold text-primary-dark border border-white/30"
                >
                  {pay}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/[0.18] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center md:text-left">
          <p className="text-white text-sm font-body">
            All Rights Reserved © 2026 Vivasaya Ulagam Agri Products
          </p>
        </div>
      </div>
    </footer>
  );
}
