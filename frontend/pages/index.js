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
      <section className="relative min-h-[auto] md:min-h-[60vh] xl:min-h-[70vh] pt-[140px] md:pt-[110px] pb-16 lg:pb-0 flex items-center overflow-hidden">

        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6 w-full z-10 relative">

          {/* Floating decorative elements — safely bounded inside the 1200px wrapper */}
          <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-6 left-0 xl:-left-12 text-brand-primary/60 pointer-events-none hidden md:block">
            <Heart size={40} fill="currentColor" />
          </motion.div>

          <motion.div animate={{ y: [0, 16, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-0 xl:-right-12 text-brand-accent pointer-events-none hidden md:block">
            <Sparkles size={36} fill="currentColor" />
          </motion.div>

          {/* Dynamic Background Blobs */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none -z-10"></div>
          <div className="absolute top-0 right-1/2 w-72 h-72 bg-brand-surface/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>
          <div className="absolute -bottom-8 right-1/3 w-72 h-72 bg-brand-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 mt-[65px] md:mt-0 relative z-10">

            {/* Left Column: Text */}
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-6 md:pt-0 w-full px-2 sm:px-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block py-1.5 px-3 bg-brand-surface text-teal-800 rounded-full text-sm font-bold tracking-wide mb-6">
                  ✨ NEW COLLECTION
                </span>
                <h1 className="text-[26px] sm:text-[30px] md:text-[36px] xl:text-[48px] font-heading font-extrabold text-brand-text leading-[1.3] mb-5 px-2">
                  Handmade Accessories for{' '}
                  <span className="relative inline-block mt-1">
                    <span className="relative z-10 px-2">Little Princesses</span>
                    <span className="absolute bottom-1 left-0 w-full h-[10px] md:h-[14px] bg-brand-primary/60 -z-10 rounded-sm"></span>
                  </span> 👑
                </h1>
                <p className="text-base md:text-lg text-brand-700 font-body mb-8 max-w-[480px]">
                  Beautiful handmade headbands made with love. Perfect unique accessories to celebrate your little one's everyday moments.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-6">
                  <Link href="/products" className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300 text-center">
                    Shop Collection
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-text border-2 border-brand-secondary/50 font-bold rounded-xl hover:bg-brand-secondary/10 hover:-translate-y-1 transition-all duration-300 text-center">
                    View Best Sellers
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 opacity-70">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="text-green-500">✔</span> Handmade
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="text-blue-400">🛡️</span> Secure
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm hidden sm:flex">
                    <span className="text-brand-primary">🚚</span> Fast Delivery
                  </div>
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

      {/* Decorative Wave Divider */}
      <div className="w-full overflow-hidden leading-none rotate-180 bg-white">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-[40px] md:h-[60px]" style={{ fill: 'var(--color-brand-background)' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

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
        <motion.section
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-[40px] md:py-[60px] xl:py-[80px] bg-white"
        >
          <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
            <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-8 text-center md:text-left">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 xl:gap-6">
              {categories.map((cat, idx) => {
                const bgImages = [
                  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1471286174890-9c112ac6f1ad?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=600',
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
        </motion.section>
      )}

      {/* 4. BEST SELLERS SECTION */}
      {featured.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-[40px] md:py-[60px] xl:py-[80px]"
        >
          <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text">
                Best Sellers 💕
              </h2>
              <Link href="/products" className="text-brand-primary font-bold text-sm hover:underline hidden sm:block">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 xl:gap-6">
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
        </motion.section>
      )}

      {/* Decorative Wave Divider */}
      <div className="w-full overflow-hidden leading-none bg-brand-background relative z-10 -mb-1">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-[40px] md:h-[60px]" style={{ fill: 'white' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* 5. PROMO BANNER (Ticket Style) */}
      <section className="py-[60px] md:py-[80px] relative w-full overflow-hidden px-4 bg-white">
        <div className="max-w-4xl mx-auto rounded-3xl promo-ticket bg-gradient-to-r from-pink-300 via-brand-primary to-brand-secondary p-1 relative overflow-hidden shadow-2xl hover:scale-[1.01] transition-transform duration-500 cursor-pointer">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -left-10 text-white/20 pointer-events-none">
            <Sparkles size={120} />
          </motion.div>

          <div className="bg-white/20 backdrop-blur-sm rounded-[22px] py-12 px-6 flex flex-col justify-center items-center text-center relative z-10 w-full h-full border border-white/40">
            <h2 className="text-[28px] md:text-[36px] font-heading font-extrabold text-white mb-2 drop-shadow-md">
              Free Gift with Orders Over 500 EGP 🎁
            </h2>
            <div className="inline-block bg-white text-brand-primary font-bold px-6 py-2 rounded-full mt-2 shadow-sm uppercase tracking-widest text-sm">
              Code: MAGIC2024
            </div>
          </div>
        </div>
      </section>



      {/* 8. ABOUT PREVIEW */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-[40px] md:py-[60px] xl:py-[80px] bg-white"
      >
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
      </motion.section>

      {/* 9. NEWSLETTER */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-[40px] md:py-[80px] bg-brand-secondary/40 border-t border-brand-secondary/60 text-center"
      >
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
      </motion.section>

    </div>
  );
}
