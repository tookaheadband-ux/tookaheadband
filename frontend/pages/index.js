import { useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Gift, ArrowRight } from 'lucide-react';

export default function Home({ featured = [], categories = [] }) {
  const { t, ui } = useLang();

  return (
    <>
    <Head>
      <title>TOOKA — Handmade Kids Accessories</title>
      <meta name="description" content="TOOKA — Beautiful handmade headbands and accessories for kids. Shop our latest collection." />
      <meta property="og:title" content="TOOKA — Handmade Kids Accessories" />
      <meta property="og:description" content="Beautiful handmade headbands and accessories for kids." />
      <meta property="og:type" content="website" />
    </Head>
    <div className="bg-brand-background">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[auto] md:min-h-[60vh] xl:min-h-[70vh] pt-[100px] md:pt-[110px] pb-16 lg:pb-0 flex items-center overflow-hidden">

        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6 w-full z-10 relative">

          {/* Floating decorative elements — safely bounded inside the 1200px wrapper */}
          <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-6 left-0 xl:-left-12 text-brand-primary/60 pointer-events-none hidden md:block">
            <Heart size={40} fill="currentColor" />
          </motion.div>

          <motion.div animate={{ y: [0, 16, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-0 xl:-right-12 text-brand-accent pointer-events-none hidden md:block">
            <Sparkles size={36} fill="currentColor" />
          </motion.div>

          {/* Clean White Background for Hero */}
          <div className="absolute top-0 right-0 w-full h-full bg-white -z-10"></div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 mt-[20px] md:mt-[65px] lg:mt-0 relative z-10">

            {/* Left Column: Text */}
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-0 md:pt-6 lg:pt-0 w-full px-2 sm:px-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block py-1.5 px-5 bg-brand-primary/15 text-brand-primary font-bold tracking-wide rounded-full text-sm mb-6 border border-brand-primary/30 shadow-sm">
                  ✨ {ui.newCollection}
                </span>
                <h1 className="text-[28px] sm:text-[32px] md:text-[36px] xl:text-[48px] font-heading font-extrabold text-brand-text leading-[1.3] mb-5 px-2">
                  {ui.heroMainTitle}{' '}
                  <span className="relative inline-block mt-1 group">
                    <span className="relative z-10 px-2 group-hover:text-brand-primary transition-colors duration-300">{ui.heroHighlight}</span>
                    <span className="absolute bottom-1 left-0 w-full h-[10px] md:h-[14px] bg-brand-primary/40 -z-10 rounded-sm group-hover:h-full group-hover:opacity-20 transition-all duration-300"></span>
                  </span> 👑
                </h1>
                <p className="text-base md:text-lg text-brand-700 font-body mb-8 max-w-[480px]">
                  {ui.heroDesc}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-8">
                  <Link href="/products" className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                    {ui.shopCollection}
                  </Link>
                  <Link href="/products?featured=true" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-text border-2 border-brand-surface font-bold rounded-2xl hover:bg-brand-surface/50 hover:-translate-y-1 transition-all duration-300 text-center">
                    {ui.viewBestSellers}
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 opacity-70">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="text-green-500">✔</span> {ui.handmade}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="text-blue-400">🛡️</span> {ui.secure}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm hidden sm:flex">
                    <span className="text-brand-primary">🚚</span> {ui.fastDelivery}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Image Collage */}
            <div className="lg:w-1/2 relative w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] aspect-square mx-auto lg:mr-0">
                {/* Main Image */}
                <motion.div
                  initial={{ opacity: 0, x: 200, y: -30, rotate: 12 }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{ duration: 1.2, type: "spring", bounce: 0.35 }}
                  className="absolute top-0 right-0 left-auto w-[78%] h-[78%] z-20"
                >
                  <div className="w-full h-full bg-white rounded-[24px] p-2 shadow-lg group hover:-translate-y-2 transition-transform duration-500 relative">
                    <Image src="/images/photo_2026-03-08_15-18-52.jpg" alt="Kids accessories" fill sizes="(max-width: 768px) 60vw, 30vw" className="object-cover rounded-[16px]" priority />
                  </div>
                </motion.div>
                {/* Secondary Image */}
                <motion.div
                  initial={{ opacity: 0, x: -200, y: 100, rotate: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.15, type: "spring", bounce: 0.35 }}
                  className="absolute bottom-0 left-0 right-auto w-[55%] h-[55%] z-30"
                >
                  <div className="w-full h-full bg-white rounded-[20px] p-2 shadow-md hover:scale-105 transition-transform duration-500 relative">
                    <Image src="/images/photo_2026-03-08_15-18-47.jpg" alt="Product detail" fill sizes="(max-width: 768px) 45vw, 20vw" className="object-cover rounded-[12px]" priority />
                  </div>
                </motion.div>
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
          className="py-[40px] md:py-[60px] xl:py-[80px] bg-white overflow-hidden"
        >
          <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
            <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-8 text-center md:text-left">
              {ui.shopByCategory}
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 xl:gap-6">
              {categories.map((cat, idx) => {
                const bgImage = cat.coverImage || '/images/placeholder-category.jpg';
                return (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: idx * 0.1, type: "spring", bounce: 0.3 }}
                  >
                    <Link href={`/products?category=${cat._id}`} className="group relative w-full h-[200px] xl:h-[240px] rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer block">
                      <Image src={bgImage} alt={t(cat.nameAr, cat.nameEn)} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized={bgImage.startsWith('/')} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                        <div className="flex items-center justify-between w-full">
                          <h3 className="text-white font-heading font-bold text-xl">{t(cat.nameAr, cat.nameEn)}</h3>
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
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
                {ui.bestSellersTitle}
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

            <div className="mt-10 text-center sm:hidden">
              <Link href="/products" className="inline-block py-3 px-8 bg-white border-2 border-brand-surface rounded-2xl font-bold text-brand-text text-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {ui.viewAllProducts}
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
      <section className="py-[60px] md:py-[80px] relative w-full overflow-hidden px-4 bg-brand-background">
        <div className="max-w-4xl mx-auto rounded-[32px] promo-ticket bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-surface p-1 relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -left-10 text-white/20 pointer-events-none">
            <Sparkles size={120} />
          </motion.div>

          <div className="bg-white/40 backdrop-blur-md rounded-[28px] py-12 px-6 flex flex-col justify-center items-center text-center relative z-10 w-full h-full border border-white/60 group-hover:bg-white/50 transition-colors duration-500">
            <h2 className="text-[28px] md:text-[36px] font-heading font-extrabold text-brand-900 mb-2 drop-shadow-sm">
              {ui.promoTitle}
            </h2>
            <div className="inline-block bg-white text-brand-primary font-bold px-8 py-3 rounded-full mt-4 shadow-sm group-hover:shadow-md transition-shadow uppercase tracking-widest text-sm">
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
              <Image src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80" alt="Making headbands" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loading="lazy" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[24px] xl:text-[32px] font-heading font-bold text-brand-text mb-4">
                {ui.handmadeWithLove}
              </h2>
              <p className="text-brand-700 font-body mb-8 leading-relaxed">
                {ui.handmadeWithLoveDesc}
              </p>
              <Link href="/about" className="h-[44px] px-8 bg-brand-text text-white font-bold rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {ui.readOurStory}
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
            {ui.joinFamily}
          </h2>
          <p className="text-brand-700 font-body mb-8">
            {ui.joinFamilyDesc}
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder={ui.enterEmail}
              className="flex-1 h-[48px] px-6 rounded-2xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors shadow-sm"
            />
            <button className="h-[48px] px-8 bg-brand-primary text-white font-bold rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
              {ui.subscribe}
            </button>
          </form>
        </div>
      </motion.section>

    </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [featRes, catRes] = await Promise.all([
      fetchProducts({ limit: 4 }),
      fetchCategories(),
    ]);
    return {
      props: {
        featured: featRes.data.products || [],
        categories: catRes.data || [],
      },
      revalidate: 60, // ISR: regenerate page every 60 seconds
    };
  } catch (err) {
    console.error('getStaticProps error:', err);
    return {
      props: { featured: [], categories: [] },
      revalidate: 30,
    };
  }
}
