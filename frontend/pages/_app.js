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
          <title>TOOKA — Handmade Headbands & Accessories</title>
          <meta name="description" content="TOOKA — Beautiful handmade headbands and accessories from Egypt. Shop unique hair accessories, clips, and more." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="keywords" content="tooka, headbands, handmade accessories, hair accessories, Egypt, hair clips, توكا, اكسسوارات, توكة" />
          <meta property="og:title" content="TOOKA — Handmade Headbands & Accessories" />
          <meta property="og:description" content="Beautiful handmade headbands and accessories from Egypt." />
          <meta property="og:url" content="https://tookaheadbands.com" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="TOOKA" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="TOOKA — Handmade Headbands & Accessories" />
          <meta name="twitter:description" content="Beautiful handmade headbands and accessories from Egypt." />
          <link rel="canonical" href="https://tookaheadbands.com" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>T</text></svg>" />
        </Head>

        {!isAdmin && <Navbar />}
        <CartDrawer />

        <main className={isAdmin ? '' : 'min-h-screen w-full'}>
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
