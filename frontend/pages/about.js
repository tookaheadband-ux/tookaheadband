import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { fetchPage } from '@/lib/api';
import { Heart, Star, Sparkles } from 'lucide-react';

export default function About() {
  const { t, ui } = useLang();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage('about')
      .then((res) => setPageData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const title = pageData ? t(pageData.titleAr, pageData.titleEn) : ui.about;
  const content = pageData ? t(pageData.contentAr, pageData.contentEn) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} — TOOKA</title>
      </Head>
      <div className="bg-brand-background min-h-[100dvh] pt-24 md:pt-36 pb-20 relative overflow-hidden flex items-center">
        
        {/* Background Blobs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-brand-300/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 pt-10 lg:pt-0 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block py-1.5 px-4 bg-white text-teal-800 rounded-full text-xs font-black tracking-widest mb-6 shadow-sm border border-brand-50 uppercase shadow-[0_2px_10px_rgba(20,184,166,0.1)]">
                  ✨ {ui.ourStory}
                </span>
                
                <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-black font-heading text-brand-text mb-8 capitalize leading-[1.2]">
                  {title}
                </h1>
                
                <div className="relative">
                  {content ? (
                    <div className="text-base sm:text-lg text-brand-700 leading-relaxed font-body space-y-5 text-left bg-white/40 p-6 sm:p-8 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-sm">
                      {content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                        <p key={index} className={index === 0 ? "text-lg sm:text-xl font-bold text-gray-900 leading-snug" : "text-gray-600 font-medium"}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic font-body">{ui.noContent}</p>
                  )}
                  
                  {/* Decorative spark on text box */}
                  <div className="absolute -top-4 -right-4 text-yellow-400 rotate-12">
                    <Sparkles size={32} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 px-4 sm:px-10 lg:px-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }} 
                animate={{ opacity: 1, scale: 1, rotate: 2 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(255,199,209,0.4)] border-[6px] border-white aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-w-md mx-auto"
              >
                <img src="/images/photo_2026-03-08_15-24-03.jpg" alt="About TOOKA" className="w-full h-full object-cover origin-center hover:scale-105 transition-transform duration-700" loading="lazy" />
              </motion.div>

              {/* Floating Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20, y: 20 }} 
                animate={{ opacity: 1, x: 0, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-2 sm:left-4 lg:-left-12 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-pink-50 max-w-[180px] sm:max-w-[220px] z-20"
              >
                <div className="flex gap-1 mb-2.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="font-black text-gray-900 text-xs sm:text-sm leading-tight">{ui.handcraftedDetail}</p>
              </motion.div>
              
              {/* Decorative Heart */}
              <div className="absolute -top-6 -right-2 sm:-top-8 sm:-right-6 text-brand-primary/50 animate-bounce" style={{ animationDuration: '3s' }}>
                <Heart size={64} fill="currentColor" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
