import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { fetchPage } from '@/lib/api';

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
      <div className="bg-brand-background min-h-screen pt-32 pb-32 relative overflow-hidden">

        {/* Decorative Blurred Blobs */}
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-20 -right-40 w-[400px] h-[400px] bg-brand-300/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading text-brand-text mb-12 capitalize tracking-wide"
          >
            {title}
          </motion.h1>

          <div className="relative">
            {/* Top SVG Wave Divider */}
            <div className="flex justify-center mb-10">
              <svg className="w-24 text-brand-300" viewBox="0 0 100 20" fill="none">
                <path d="M0,10 Q25,20 50,10 T100,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {content ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center text-sm sm:text-lg text-brand-700 leading-relaxed mx-auto max-w-2xl font-body"
              >
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">{paragraph}</p>
                ))}
              </motion.div>
            ) : (
              <p className="text-brand-400 italic font-body">No content available.</p>
            )}

            {/* Bottom SVG Wave Divider */}
            <div className="flex justify-center mt-10">
              <svg className="w-24 text-brand-300" viewBox="0 0 100 20" fill="none">
                <path d="M0,10 Q25,0 50,10 T100,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
