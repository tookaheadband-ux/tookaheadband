import { useState, useEffect } from 'react';
import Head from 'next/head';
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
      <div className="bg-white min-h-screen pt-32 pb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[var(--font-family-heading)] text-brand-900 mb-12 uppercase tracking-widest animate-fade-in">
            {title}
          </h1>

          <div className="relative">
            <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-6 h-[1px] bg-brand-900/30" />

            {content ? (
              <div className="text-center text-sm sm:text-base text-brand-700 leading-loose mx-auto max-w-2xl font-medium animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-brand-400 italic">No content available.</p>
            )}

            <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 w-6 h-[1px] bg-brand-900/30" />
          </div>

        </div>
      </div>
    </>
  );
}
