import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetFeatureFlags, adminUpdateFeatureFlags } from '@/lib/api';

export default function AdminSettings() {
  const { ui } = useLang();
  const { toast } = useToast();
  const router = useRouter();
  const [flags, setFlags] = useState({
    feature_flash_sales: false,
    feature_bundles: false,
    feature_social_proof: false,
    feature_gift_wrap: false,
    feature_customer_db: false,
  });
  const [giftWrapPrice, setGiftWrapPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  useEffect(() => {
    adminGetFeatureFlags()
      .then((r) => {
        const d = r.data;
        setFlags({
          feature_flash_sales: !!d.feature_flash_sales,
          feature_bundles: !!d.feature_bundles,
          feature_social_proof: !!d.feature_social_proof,
          feature_gift_wrap: !!d.feature_gift_wrap,
          feature_customer_db: !!d.feature_customer_db,
        });
        if (d.gift_wrap_price != null) setGiftWrapPrice(String(d.gift_wrap_price));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateFeatureFlags({ ...flags, gift_wrap_price: Number(giftWrapPrice) || 0 });
      toast.success(ui.save + ' ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const toggleItems = [
    { key: 'feature_flash_sales', label: ui.flashSalesLabel },
    { key: 'feature_bundles', label: ui.bundlesLabel },
    { key: 'feature_social_proof', label: ui.socialProofLabel },
    { key: 'feature_gift_wrap', label: ui.giftWrapLabel },
    { key: 'feature_customer_db', label: ui.customerDbLabel },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="settings" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-2xl font-black text-gray-900 mb-6">⚙️ {ui.settings}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Feature Flags Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-black text-gray-900 mb-6">{ui.featureFlags}</h2>
              <div className="space-y-4">
                {toggleItems.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{key}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${flags[key] ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {flags[key] ? ui.enabled : ui.disabled}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={flags[key]}
                        onClick={() => handleToggle(key)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${
                          flags[key] ? 'bg-gradient-to-r from-pink-400 to-rose-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            flags[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Wrap Price Card */}
            {flags.feature_gift_wrap && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-black text-gray-900 mb-4">🎁 {ui.giftWrapPrice}</h2>
                <div className="max-w-xs">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={giftWrapPrice}
                    onChange={(e) => setGiftWrapPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-8 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? ui.saving : ui.save}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

AdminSettings.isAdmin = true;
