import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { useFeatureFlags } from '@/context/FeatureFlagContext';
import BundleCard from '@/components/BundleCard';
import { fetchActiveBundles } from '@/lib/api';
import { Gift } from 'lucide-react';

export default function BundlesPage() {
  const { ui } = useLang();
  const { isEnabled } = useFeatureFlags();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBundles()
      .then((res) => setBundles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If feature disabled AND no bundles, redirect to products
  // But if bundles exist, show them regardless of flag

  return (
    <>
      <Head>
        <title>{ui.bundlesLabel || 'Bundle Deals'} — TOOKA</title>
        <meta name="description" content="Save more with TOOKA bundle deals. Get multiple products at a special price." />
      </Head>

      <div className="bg-brand-background min-h-screen pt-28 pb-20">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/20 rounded-2xl mb-4">
              <Gift className="text-brand-primary" size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-brand-text mb-3">
              {ui.bundlesLabel || 'Bundle Deals'} 🎁
            </h1>
            <p className="text-brand-700 font-body max-w-md mx-auto">
              {ui.bundleSaveMore || 'Get more for less! Grab a bundle and save.'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold">{ui.loading}</div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg font-bold mb-4">{ui.noBundles || 'No bundles available right now'}</p>
              <Link href="/products" className="inline-block px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:-translate-y-1 transition-all">
                {ui.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {bundles.map((bundle) => (
                <BundleCard key={bundle._id} bundle={bundle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
