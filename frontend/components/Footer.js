import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export default function Footer() {
  const { ui } = useLang();

  return (
    <>
      <footer className="mt-20 border-t border-brand-200 bg-brand-background text-brand-text">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-5 lg:px-6 py-10 md:py-15 xl:py-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-[24px]">

            {/* Section 1: Brand */}
            <div className="flex flex-col gap-4">
              <h3 className="text-3xl font-extrabold font-heading text-brand-text uppercase">TOOKA</h3>
              <p className="text-sm font-body text-brand-700 leading-relaxed">
                {ui.footerDesc}
              </p>
              <div className="flex gap-4 mt-2">
                {/* Social Links */}
                <a href="https://www.instagram.com/tooka_headbands" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/Tooka-for-headbands-111838657985303" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                </a>
              </div>
            </div>

            {/* Section 2: Links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold font-heading text-brand-text mb-2">{ui.quickLinks}</h4>
              <Link href="/" className="text-sm font-body text-brand-700 hover:text-brand-primary transition-colors">{ui.home}</Link>
              <Link href="/products" className="text-sm font-body text-brand-700 hover:text-brand-primary transition-colors">{ui.allProducts}</Link>
              <Link href="/about" className="text-sm font-body text-brand-700 hover:text-brand-primary transition-colors">{ui.about}</Link>
            </div>

            {/* Section 3: Contact */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold font-heading text-brand-text mb-2">{ui.contactUs}</h4>
              <p className="text-sm font-body text-brand-700">Email: hello@tooka.com</p>
              <p className="text-sm font-body text-brand-700">Phone: +20 100 208 4496</p>
              <p className="text-sm font-body text-brand-700">Cairo, Egypt</p>
            </div>

            {/* Section 4: Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold font-heading text-brand-text mb-2">{ui.joinNewsletter}</h4>
              <p className="text-sm font-body text-brand-700 mb-2">{ui.newsletterHint}</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder={ui.yourEmail} className="flex-1 min-w-0 px-4 py-2 rounded-xl border border-brand-200 focus:outline-none focus:border-brand-primary text-sm" />
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform">
                  {ui.subscribe}
                </button>
              </form>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-brand-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-body text-brand-700">&copy; {new Date().getFullYear()} TOOKA. {ui.allRights}</p>
          </div>
        </div>
      </footer>

    </>
  );
}
