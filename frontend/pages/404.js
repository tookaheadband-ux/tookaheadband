import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found — TOOKA</title>
      </Head>
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <p className="text-8xl mb-6">🎀</p>
          <h1 className="text-6xl font-extrabold font-heading text-brand-text mb-3">404</h1>
          <p className="text-xl font-bold text-brand-700 mb-2">Oops! Page not found</p>
          <p className="text-sm text-brand-500 font-body mb-10">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="h-12 px-8 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              Go Home
            </Link>
            <Link
              href="/products"
              className="h-12 px-8 bg-white border-2 border-brand-surface text-brand-text font-bold rounded-xl flex items-center justify-center hover:bg-brand-surface/50 hover:-translate-y-1 transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
