import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export default function OrderSuccess() {
  const { ui } = useLang();

  return (
    <div className="bg-brand-background min-h-[85vh] flex items-center justify-center pt-24 pb-32">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        <div className="w-24 h-24 bg-white border-[4px] border-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg className="w-10 h-10 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-[var(--font-family-heading)] text-brand-900 mb-4 tracking-widest uppercase">
          {ui.orderSuccess}
        </h1>
        <p className="text-sm md:text-base text-brand-700 leading-relaxed mb-12 font-medium font-body">
          {ui.orderSuccessMsg}
        </p>
        <Link href="/" className="h-[56px] w-full max-w-[240px] mx-auto flex items-center justify-center bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300">
          {ui.backToHome}
        </Link>
      </div>
    </div>
  );
}
