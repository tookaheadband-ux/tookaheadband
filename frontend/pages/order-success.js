import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export default function OrderSuccess() {
  const { ui } = useLang();

  return (
    <div className="bg-white min-h-[85vh] flex items-center justify-center pt-24 pb-32">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-brand-50 border border-brand-200 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-[var(--font-family-heading)] text-brand-900 mb-4 tracking-widest uppercase">
          {ui.orderSuccess}
        </h1>
        <p className="text-sm text-brand-700 leading-relaxed mb-12 font-medium">
          {ui.orderSuccessMsg}
        </p>
        <Link href="/" className="btn-primary w-full max-w-[200px]">
          {ui.backToHome}
        </Link>
      </div>
    </div>
  );
}
