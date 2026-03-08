import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { PackageSearch } from 'lucide-react';

export default function OrderSuccess() {
  const { ui } = useLang();
  const router = useRouter();
  const { orderId } = router.query;

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
        <p className="text-sm md:text-base text-brand-700 leading-relaxed mb-8 font-medium font-body">
          {ui.orderSuccessMsg}
        </p>
        {orderId && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm text-left">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Your Order ID</p>
            <p className="font-black text-gray-900 text-sm break-all mb-3 select-all">{orderId}</p>
            <p className="text-xs text-gray-400 font-bold">Save this ID to track your order status anytime.</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={"/track-order?orderId=" + orderId}
              className="h-[48px] px-6 flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-text font-bold text-sm rounded-xl hover:-translate-y-1 transition-all duration-300">
              <PackageSearch size={16} />
              Track My Order
            </Link>
          )}
          <Link href="/"
            className="h-[48px] px-6 flex items-center justify-center bg-brand-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:-translate-y-1 transition-all duration-300">
            {ui.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
