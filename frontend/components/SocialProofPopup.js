import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { fetchSocialProof } from '@/lib/api';
import { useFeatureFlags } from '@/context/FeatureFlagContext';
import { useLang } from '@/context/LanguageContext';

const DISMISS_KEY = 'toka-social-proof-dismissed';
const INTERVAL_MS = 30000;
const SHOW_DURATION_MS = 5000;

function timeAgo(dateStr, ui) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return ui.justBought || 'just now';
  if (minutes < 60) return `${minutes} ${ui.minutesAgo || 'min ago'}`;
  return `${hours} ${ui.hoursAgo || 'hr ago'}`;
}

export default function SocialProofPopup() {
  const router = useRouter();
  const { isEnabled } = useFeatureFlags();
  const { ui, lang } = useLang();

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    }
  }, []);

  // Fetch data once on mount
  useEffect(() => {
    if (!isEnabled('feature_social_proof')) return;

    fetchSocialProof()
      .then((res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, [isEnabled]);

  // Cycle through items every 30s
  useEffect(() => {
    if (dismissed || items.length === 0) return;

    // Show the first one after a short initial delay
    const initialTimeout = setTimeout(() => {
      setVisible(true);
    }, 3000);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setVisible(true);
    }, INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [dismissed, items]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, SHOW_DURATION_MS);

    return () => clearTimeout(timer);
  }, [visible, currentIndex]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, '1');
    }
  }, []);

  // Don't render on admin pages
  if (router.pathname.startsWith('/admin')) return null;

  // Don't render if feature flag is off or dismissed
  if (!isEnabled('feature_social_proof') || dismissed) return null;

  if (items.length === 0) return null;

  const item = items[currentIndex];
  if (!item) return null;

  const isRtl = lang === 'ar';

  return (
    <div
      className={`fixed bottom-4 z-50 transition-all duration-500 ease-in-out ${
        isRtl ? 'right-4' : 'left-4'
      } ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
      style={{ maxWidth: '340px' }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 flex items-start gap-3 relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 transition-colors p-1 leading-none text-sm"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Product thumbnail */}
        {item.productImage && (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-14 h-14 object-cover rounded-md flex-shrink-0"
          />
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0 pe-4">
          <p className="text-sm font-medium text-gray-800 leading-snug">
            {item.name} {isRtl ? 'من' : 'from'} {item.governorate}
          </p>
          <p className="text-sm text-pink-600 leading-snug mt-0.5">
            {ui.justBought || (isRtl ? 'اشترى' : 'bought')} {item.productName}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {timeAgo(item.createdAt, ui)}
          </p>
        </div>
      </div>
    </div>
  );
}
