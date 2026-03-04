import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Heart, Gift, Truck, ShieldCheck, Instagram, ArrowRight, Quote } from 'lucide-react';

export default function Home() {
  const { t, ui } = useLang();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          fetchProducts({ limit: 4 }), // Fetch best sellers / featured
          fetchCategories(),
        ]);
        setFeatured(featRes.data.products);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-[4px] border-brand-surface border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-brand-background">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[auto] md:min-h-[60vh] xl:min-h-[70vh] pt-24 md:pt-32 pb-16 lg:pb-0 flex items-center overflow-hidden">

        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6 w-full z-10 relative">

          {/* Floating decorative elements — safely bounded inside the 1200px wrapper */}
          <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-6 left-0 xl:-left-12 text-brand-primary/60 pointer-events-none hidden md:block">
            <Heart size={40} fill="currentColor" />
          </motion.div>

          <motion.div animate={{ y: [0, 16, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-0 xl:-right-12 text-brand-accent pointer-events-none hidden md:block">
            <Sparkles size={36} fill="currentColor" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

            {/* Left Column: Text */}
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block py-1.5 px-3 bg-brand-surface text-teal-800 rounded-full text-sm font-bold tracking-wide mb-6">
                  ✨ NEW COLLECTION
                </span>
                <h1 className="text-[28px] md:text-[40px] xl:text-[48px] font-heading font-extrabold text-brand-text leading-[1.25] mb-6">
                  Handmade Accessories for <br className="hidden md:block" />
                  <span className="relative inline-block mt-1">
                    <span className="relative z-10 px-2">Little Princesses</span>
                    <span className="absolute bottom-1 left-0 w-full h-[12px] md:h-[16px] bg-brand-primary/60 -z-10 rounded-sm"></span>
                  </span> 👑
                </h1>
                <p className="text-base md:text-lg text-brand-700 font-body mb-8 max-w-[480px]">
                  Beautiful handmade headbands made with love. Perfect unique accessories to celebrate your little one's everyday moments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="/products" className="h-[48px] px-7 bg-brand-primary text-brand-text font-bold rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                    Shop Collection
                  </Link>
                  <Link href="/products?featured=true" className="h-[48px] px-7 bg-white text-brand-text border-2 border-brand-secondary font-bold rounded-xl flex items-center justify-center hover:bg-brand-secondary/30 transition-colors">
                    View Best Sellers
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Image Collage */}
            <div className="lg:w-1/2 relative w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] aspect-square mx-auto lg:mr-0">
                {/* Main Image */}
                <div className="absolute top-0 right-0 left-auto w-[78%] h-[78%] bg-white rounded-2xl p-2 shadow-xl z-20">
                  <img src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=600" alt="Kids accessories" className="w-full h-full object-cover rounded-[12px]" />
                </div>
                {/* Secondary Image */}
                <div className="absolute bottom-0 left-0 right-auto w-[55%] h-[55%] bg-white rounded-2xl p-2 shadow-lg z-30">
                  <img src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=400" alt="Product detail" className="w-full h-full object-cover rounded-[12px]" />
                </div>
                {/* Decorative blob — clipped by section overflow-hidden */}
                <div className="absolute top-[10%] left-[5%] w-[55%] h-[55%] bg-brand-secondary/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="py-[40px] md:py-[60px] xl:py-[80px]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-pink-500 shrink-0">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-brand-text text-lg mb-1">Handmade with Love</h3>
                <p className="text-sm text-brand-700 font-body">Crafted carefully by hand ensuring unique quality.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-teal-600 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-brand-text text-lg mb-1">Safe for Kids</h3>
                <p className="text-sm text-brand-700 font-body">Soft, non-toxic materials perfect for delicate skin.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-start gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-brand-secondary/40 flex items-center justify-center text-purple-600 shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-brand-text text-lg mb-1">Cash on Delivery</h3>
                <p className="text-sm text-brand-700 font-body">Pay securely when your package arrives at your door.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      {categories.length > 0 && (
        <section className="py-[40px] md:py-[60px] xl:py-[80px] bg-white">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
            <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-8 text-center md:text-left">
              Shop by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 xl:gap-6">
              {categories.map((cat, idx) => {
                const bgImages = [
                  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1535632787350-4e68ef0ac189?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=600'
                ];
                return (
                  <Link key={cat._id} href={`/products?category=${cat._id}`} className="group relative w-full h-[180px] xl:h-[220px] rounded-[16px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                    <img src={bgImages[idx % bgImages.length]} alt={t(cat.nameAr, cat.nameEn)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="text-white font-heading font-bold text-xl">{t(cat.nameAr, cat.nameEn)}</h3>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. BEST SELLERS SECTION */}
      {featured.length > 0 && (
        <section className="py-[40px] md:py-[60px] xl:py-[80px]">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text">
                Best Sellers 💕
              </h2>
              <Link href="/products" className="text-brand-primary font-bold text-sm hover:underline hidden sm:block">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 xl:gap-6">
              {featured.map((product) => (
                <div key={product._id} className="group hover:-translate-y-2 transition-transform duration-300">
                  <ProductCard product={product} />
                  {/* The actual product card internally handles the rounded corners and sizing, we just wrap it with the hover lift */}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/products" className="inline-block py-3 px-6 bg-white border-2 border-brand-primary rounded-xl font-bold text-brand-text text-sm">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. PROMO BANNER */}
      <section className="w-full h-[160px] bg-gradient-to-r from-pink-300 via-brand-primary to-brand-secondary relative overflow-hidden flex flex-col justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -left-10 text-white/20 pointer-events-none">
          <Sparkles size={120} />
        </motion.div>
        <div className="max-w-screen-2xl mx-auto px-4 text-center relative z-10 w-full">
          <h2 className="text-[28px] md:text-[36px] font-heading font-extrabold text-white mb-2 drop-shadow-sm">
            Free Gift with Orders Over 500 EGP 🎁
          </h2>
          <p className="text-white/90 font-medium text-lg">Use code: MAGIC2024 at checkout</p>
        </div>
      </section>

      {/* 6. TOKA MOMENTS GALLERY */}
      <section className="py-[40px] md:py-[60px] xl:py-[80px] bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-2">
              TOKA Moments
            </h2>
            <p className="text-brand-700 font-body">Tag @tooka_headbands to be featured!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
            {[
              "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1471286174890-9c112ac6f1ad?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80"
            ].map((img, i) => (
              <div key={i} className="relative w-full h-[200px] xl:h-[240px] rounded-[16px] overflow-hidden group cursor-pointer">
                <img src={img} alt="Gallery moment" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center">
                  <Instagram size={40} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-[40px] md:py-[60px] xl:py-[80px] overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
          <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-center text-brand-text mb-10">
            Happy Moms Say...
          </h2>

          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x hide-scrollbar gap-4 md:gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="shrink-0 w-[280px] md:w-[360px] snap-center bg-brand-secondary/30 p-6 rounded-[16px] border border-brand-secondary/50">
                <Quote size={24} className="text-brand-primary mb-4" />
                <p className="text-brand-text font-medium text-[15px] leading-relaxed mb-4">
                  "Absolutely love these headbands! The quality is amazing, super soft against my baby's head, and they don't leave marks. Will definitely order more."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-text text-white flex items-center justify-center font-bold">SM</div>
                  <div>
                    <h4 className="font-bold text-sm text-brand-text">Sarah M.</h4>
                    <span className="text-xs text-brand-700">Verified Buyer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ABOUT PREVIEW */}
      <section className="py-[40px] md:py-[60px] xl:py-[80px] bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
            <div className="w-full md:w-1/2 relative h-[260px] md:h-[380px] rounded-[16px] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1607525384119-9dc490de9f41?auto=format&fit=crop&w=800&q=80" alt="Making headbands" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-4">
                Handmade with Love 💖
              </h2>
              <p className="text-brand-700 font-body mb-8 leading-relaxed">
                Every single piece is cut, sewn, and assembled by hand in our studio. We use only the softest fabrics sourced carefully to ensure the absolute best quality for your little ones.
              </p>
              <Link href="/about" className="h-[40px] px-6 bg-brand-text text-white font-bold rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER */}
      <section className="py-[40px] md:py-[80px] bg-brand-secondary/40 border-t border-brand-secondary/60 text-center">
        <div className="max-w-[600px] mx-auto px-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-brand-primary">
            <Gift size={32} />
          </div>
          <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-3">
            Join the TOKA Family
          </h2>
          <p className="text-brand-700 font-body mb-8">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-[44px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors"
            />
            <button className="h-[44px] px-8 bg-brand-primary text-brand-text font-bold rounded-xl hover:scale-105 transition-transform whitespace-nowrap shadow-sm">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
