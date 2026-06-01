'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, Heart, Eye, Award, Leaf, ShieldCheck, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function parseStatValue(value: string) {
  const source = String(value || "0");
  const match = source.match(/[\d,.]+/);
  const numberText = match?.[0] || "0";
  const target = Number(numberText.replace(/,/g, ""));
  const suffix = source.replace(numberText, "");
  return { target: Number.isFinite(target) ? target : 0, suffix };
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const statRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!statRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const { target, suffix } = parseStatValue(value);
    const state = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: statRef.current,
          start: "top 82%",
          once: true,
        },
        onUpdate: () => {
          if (!statRef.current) return;
          statRef.current.textContent = `${Math.round(state.value).toLocaleString("en-IN")}${suffix}`;
        },
      });
    }, statRef);

    return () => ctx.revert();
  }, [value]);

  return (
    <div>
      <p ref={statRef} className="text-3xl md:text-5xl font-black text-primary">
        0
      </p>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
        {label}
      </p>
    </div>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const timelineLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = (await res.json()) as { success?: boolean; settings?: Record<string, string> };
        if (data.success) {
          setSettings(data.settings || {});
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (loading || !timelineLineRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        timelineLineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineLineRef.current,
            start: "top 78%",
            end: "bottom 45%",
            scrub: true,
          },
        }
      );
    }, timelineLineRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans text-gray-800">
      <Navbar />

      {/* 1. Dynamic Hero Banner */}
      <section 
        className={`hero-banner-container bg-gradient-to-br ${settings.about_hero_bg || "from-primary to-primary-dark"} py-24 px-6 text-center text-white relative overflow-hidden bg-cover bg-center`}
        style={settings.about_hero_image ? { backgroundImage: `url(${settings.about_hero_image})` } : {}}
      >
        {settings.about_hero_image ? (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        ) : (
          <div className="premium-radial-soft absolute inset-0" />
        )}
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] bg-green-800/80 text-green-200 border border-green-700 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Our Legacy
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mt-2 drop-shadow-md">
            {settings.about_hero_title || "Nurturing Wholesome Living"}
          </h1>
          <p className="text-sm md:text-base text-green-100/90 leading-relaxed max-w-lg mx-auto drop-shadow-sm">
            {settings.about_hero_subtitle || "Honoring traditional farming wisdom to deliver pure, unadulterated organic products directly to your doorstep."}
          </p>
        </div>
      </section>
 
      {/* 2. Brand Story */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Leaf size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {settings.about_story_tag || "Our Beginnings"}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {settings.about_story_title || "Cultivating Health and Preserving Bio-diversity"}
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {settings.about_story_desc_1 || "Founded with a modest vision to revitalize local agrarian heritage in Tamil Nadu, Vivasaya Ullagam has grown into a trusted cooperative network of over 40 certified organic farms. We recognized that the modern diet is heavily burdened by processed chemicals, stripping our tables of authentic, nutrient-dense nutrition."}
          </p>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {settings.about_story_desc_2 || "Every grain of millet, drop of forest honey, and spoon of desi ghee we offer represents a sacred bond with soil health. We combine age-old organic farming techniques with clean, minimal modern processing to deliver unparalleled quality."}
          </p>
        </div>
 
        {/* Story Illustration Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-green-50 to-lime-50 rounded-3xl p-8 border border-green-100 space-y-6 flex flex-col justify-center shadow-sm overflow-hidden">
          {settings.about_story_image ? (
            <div className="space-y-4">
              <img
                src={settings.about_story_image}
                alt="Our Story Illustration"
                className="w-full h-48 object-cover rounded-2xl shadow-sm border border-green-100"
              />
              <blockquote className="space-y-2">
                <p className="text-sm italic text-primary font-medium leading-relaxed">
                  &ldquo;{settings.about_story_quote || "Organic farming is not just a commercial catalog; it is an act of restoration. It restores our health, our ecosystem, and our respect for nature."}&rdquo;
                </p>
                <cite className="block text-xs font-extrabold text-gray-800 mt-2">
                  - {settings.about_story_cite || "Vivasaya Farmers Council"}
                </cite>
              </blockquote>
            </div>
          ) : (
            <>
              <span className="text-sm font-extrabold uppercase tracking-widest text-primary select-none">Harvest Notes</span>
              <blockquote className="space-y-2">
                <p className="text-sm italic text-primary font-medium leading-relaxed">
                  &ldquo;{settings.about_story_quote || "Organic farming is not just a commercial catalog; it is an act of restoration. It restores our health, our ecosystem, and our respect for nature."}&rdquo;
                </p>
                <cite className="block text-xs font-extrabold text-gray-800 mt-2">
                  - {settings.about_story_cite || "Vivasaya Farmers Council"}
                </cite>
              </blockquote>
            </>
          )}
        </div>
      </section>

      {/* 3. Mission, Vision, and Core values */}
      <section className="bg-gray-50 border-y border-gray-200/60 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="tilt-card bg-white border border-primary/10 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Target size={18} />
            </div>
            <h3 className="font-extrabold text-base text-gray-800">
              {settings.about_mission_title || "Our Mission"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {settings.about_mission_desc || "To build a direct, transparent bridge between dedicated traditional farmers and conscious families seeking uncompromised, clean organic nourishment."}
            </p>
          </div>

          <div className="tilt-card bg-white border border-primary/10 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Eye size={18} />
            </div>
            <h3 className="font-extrabold text-base text-gray-800">
              {settings.about_vision_title || "Our Vision"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {settings.about_vision_desc || "To foster healthier community generations by making authentic, native grains, cold-pressed oils, and traditional sweeteners accessible globally."}
            </p>
          </div>

          <div className="tilt-card bg-white border border-primary/10 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Heart size={18} />
            </div>
            <h3 className="font-extrabold text-base text-gray-800">
              {settings.about_values_title || "Our Values"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {settings.about_values_desc || "Absolute pesticide-free verification, fair compensation policies for organic farmers, ecological sustainability, and transparent quality tracking."}
            </p>
          </div>

        </div>
      </section>

      {/* 4. Statistics counters */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={settings.about_stat1_val || "55000+"} label={settings.about_stat1_lbl || "Farmers Reached"} />
          <AnimatedStat value={settings.about_stat2_val || "100%"} label={settings.about_stat2_lbl || "Pesticide-Free"} />
          <AnimatedStat value={settings.about_stat3_val || "10k+"} label={settings.about_stat3_lbl || "Happy Families"} />
          <AnimatedStat value={settings.about_stat4_val || "150+"} label={settings.about_stat4_lbl || "Verified Products"} />
        </div>
      </section>

      {/* 5. Trust Timeline & Achievements */}
      <section className="bg-secondary border-t border-primary/10 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Our Growth Journey</h3>
            <p className="text-xs text-gray-400 font-medium">Step-by-step commitment to restoring soil and health values.</p>
          </div>

          <div className="relative pl-8 ml-4 space-y-10">
            <div className="absolute left-0 top-0 h-full w-px bg-primary/15">
              <div ref={timelineLineRef} className="timeline-draw h-full w-px bg-primary" />
            </div>
            {/* Item 1 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <h4 className="font-extrabold text-sm text-gray-800">
                {settings.about_timeline_year1 || "2024"} - {settings.about_timeline_title1 || "Rooting the Cooperative"}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {settings.about_timeline_desc1 || "Started as a joint coalition with 10 traditional farmers in Western Tamil Nadu to address high pesticide residues in urban rice supplies."}
              </p>
            </div>

            {/* Item 2 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <h4 className="font-extrabold text-sm text-gray-800">
                {settings.about_timeline_year2 || "2025"} - {settings.about_timeline_title2 || "Native Crop Catalog Launch"}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {settings.about_timeline_desc2 || "Expanded catalog to include nutrient-dense millet noodles, raw forest honey, and cold-pressed oils. Partnered with regional certification networks."}
              </p>
            </div>

            {/* Item 3 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <h4 className="font-extrabold text-sm text-gray-900">
                {settings.about_timeline_year3 || "2026"} - {settings.about_timeline_title3 || "Clean Store Digitization"}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {settings.about_timeline_desc3 || "Upgraded our technology architecture to launch custom farm builder pages, dynamic category controls, and quick regional distributions."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Guarantees</span>
          <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900">Uncompromised Standard</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="tilt-card p-6 bg-white border border-primary/10 rounded-2xl shadow-sm text-center space-y-3">
            <ShieldCheck className="mx-auto text-primary" size={28} />
            <h4 className="font-extrabold text-sm text-gray-800">Lab Certified</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every single batch is tested for standard quality parameters, ensuring 0% traces of chemical fertilizers.
            </p>
          </div>

          <div className="tilt-card p-6 bg-white border border-primary/10 rounded-2xl shadow-sm text-center space-y-3">
            <TrendingUp className="mx-auto text-primary" size={28} />
            <h4 className="font-extrabold text-sm text-gray-800">Support Rural Economy</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              We return up to 75% of sales value directly back to cooperative farmers, keeping native economies alive and thriving.
            </p>
          </div>

          <div className="tilt-card p-6 bg-white border border-primary/10 rounded-2xl shadow-sm text-center space-y-3">
            <Award className="mx-auto text-primary" size={28} />
            <h4 className="font-extrabold text-sm text-gray-800">Premium Taste & Freshness</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Native species produce unmatched authentic textures, distinct sweet herbal notes, and premium aromas.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action section */}
      <section className="bg-gradient-to-br from-primary-dark to-primary text-white py-16 px-6 text-center rounded-3xl max-w-6xl mx-auto w-full mb-16 shadow-xl relative overflow-hidden">
        <div className="premium-radial-soft absolute inset-0 pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-extrabold leading-tight">
            {settings.about_cta_title || "Ready to Taste Wholesome Farm Purity?"}
          </h3>
          <p className="text-xs md:text-sm text-green-100 max-w-md mx-auto leading-relaxed">
            {settings.about_cta_subtitle || "Browse our fresh categories of high-fidelity, pesticide-free grains, noodles, oils, and sweeteners."}
          </p>
          <div className="pt-2">
            <Link
              href={settings.about_cta_btn_link || "/shop"}
              className="inline-flex bg-white text-gray-900 text-xs md:text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-all hover:scale-[1.02]"
            >
              {settings.about_cta_btn_text || "Browse Catalog"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
