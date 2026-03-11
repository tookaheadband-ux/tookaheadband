import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
      <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6">
        <div className="relative grid grid-cols-3 md:flex md:items-center md:justify-between h-[60px] xl:h-[72px] items-center">

          {/* Mobile Menu Button - Left */}
          <div className="flex md:hidden justify-start">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Logo - Center on Mobile, Left on Desktop */}
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo/logo.jpg" alt="TOOKA Logo" width={120} height={28} priority className="h-[24px] md:h-[28px] max-w-[120px] object-contain" />
              <span className="text-xl md:text-2xl font-bold tracking-wide font-heading text-brand-text uppercase mt-1">
                TOOKA
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Center */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-brand-text hover:text-brand-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions - Right */}
          <div className="flex justify-end md:items-center gap-3 md:gap-5">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative group" aria-label="Wishlist">
              <svg className="w-5 h-5 text-brand-text" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="relative group flex items-center gap-2"
              aria-label="Cart"
            >
              <span className="hidden sm:block text-xs lg:text-sm tracking-[0.15em] lg:tracking-[0.2em] uppercase font-bold text-brand-700 group-hover:text-brand-900 transition-colors">
                {ui.cart}
              </span>
              <div className="relative">
                <svg className="w-5 h-5 text-brand-text" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-brand-text text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
            </button>

            {/* Shop Button */}
            <Link href="/products" className="hidden sm:flex items-center justify-center bg-brand-primary text-brand-text hover:bg-brand-secondary transition-all font-semibold rounded-xl text-sm" style={{ height: '40px', padding: '0 24px' }}>
              {ui.shopNow}
            </Link>
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
