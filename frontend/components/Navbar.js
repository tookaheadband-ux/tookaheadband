import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { ui } = useLang();
  const { itemCount, setIsOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: ui.home },
    { href: '/products', label: ui.products },
    { href: '/track-order', label: ui.trackOrder },
    { href: '/about', label: ui.about },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto
        ${scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-b border-white/40 py-2 md:py-3'
          : 'bg-transparent py-4 md:py-6'
        }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] xl:h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo/logo.jpg" alt="TOOKA Logo" width={32} height={32} priority className="w-8 h-8 object-contain rounded-md" />
            <span className="text-[20px] md:text-[22px] font-extrabold tracking-widest font-heading text-brand-text uppercase">
              TOOKA
            </span>
          </Link>

          {/* Desktop Nav - Center */}
          <div className="hidden lg:flex items-center gap-10 xl:gap-14">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-semibold text-brand-700 hover:text-brand-primary transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 transition-colors" aria-label="Wishlist">
              <svg className="w-[18px] h-[18px] text-brand-text" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-primary text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 transition-colors"
              aria-label="Cart"
            >
              <svg className="w-[18px] h-[18px] text-brand-text" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-primary text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Shop Button */}
            <Link href="/products" className="hidden md:flex items-center justify-center bg-brand-primary text-white hover:bg-brand-primary/90 transition-all font-bold rounded-xl text-sm h-[38px] px-5">
              {ui.shopNow}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 transition-colors"
            >
              <svg className="w-5 h-5 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white border border-brand-200 p-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm tracking-[0.1em] uppercase font-medium text-brand-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-100">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
