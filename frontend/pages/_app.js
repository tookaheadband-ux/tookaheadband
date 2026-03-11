import '@/styles/globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Lazy-load below-fold components to reduce initial bundle size
const FloatingWhatsApp = dynamic(() => import('@/components/FloatingWhatsApp'), { ssr: false });
const BackToTop = dynamic(() => import('@/components/BackToTop'), { ssr: false });

export default function App({ Component, pageProps }) {
  const isAdmin = Component.isAdmin;

  return (
    <LanguageProvider>
      <CartProvider>
        <WishlistProvider>
        <ToastProvider>
        <Head>
          <title>TOOKA — Handmade Accessories</title>
          <meta name="description" content="TOOKA — Beautiful handmade accessories from Egypt. Hair clips, bracelets, necklaces, earrings and more." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>T</text></svg>" />
        </Head>

        {!isAdmin && <Navbar />}
        <CartDrawer />

        <main className={isAdmin ? '' : 'min-h-screen overflow-x-hidden w-full relative'}>
          <Component {...pageProps} />
        </main>

        {!isAdmin && <Footer />}
        {!isAdmin && <FloatingWhatsApp />}
        {!isAdmin && <BackToTop />}
        </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
