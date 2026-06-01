"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section
      id="newsletter"
      className="py-20 bg-gradient-to-br from-primary-dark to-primary relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-5xl block mb-4">💌</span>

          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
            Stay Connected. Stay Healthy.
          </h2>
          <p className="text-white/75 font-body text-base mb-8">
            Subscribe for exclusive offers, farm-fresh recipes & organic wellness tips
            delivered straight to your inbox.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/30 rounded-2xl px-8 py-6"
            >
              <span className="text-4xl block mb-2">🎉</span>
              <p className="font-heading font-bold text-white text-xl">
                You&apos;re subscribed!
              </p>
              <p className="text-white/70 text-sm mt-1">
                Welcome to the Vivasaya Ulagam family. Watch your inbox!
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border border-white/30 rounded-full px-5 py-3.5 text-white
                  placeholder-white/50 outline-none focus:border-white/60 focus:bg-white/15 transition-all
                  text-sm font-body"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                className="bg-white text-primary font-heading font-bold px-7 py-3.5 rounded-full
                  hover:bg-cream transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
                  whitespace-nowrap text-sm"
                aria-label="Subscribe to newsletter"
              >
                Subscribe ✨
              </button>
            </form>
          )}

          <p className="text-white/40 text-xs mt-4 font-body">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/60 text-xs font-body">
            {["🌿 Weekly Tips", "🎁 Exclusive Offers", "🍳 Organic Recipes", "🌾 Farm Stories"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1">
                  {item}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
