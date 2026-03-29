import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProfitReport, adminGetOfflineSales, adminCreateOfflineSale, adminDeleteOfflineSale, adminGetExpenses, adminCreateExpense, adminDeleteExpense, adminGetProducts } from '@/lib/api';

export default function AdminProfit() {
  const { t, ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tab, setTab] = useState('overview');

  // Offline sale form
  const [products, setProducts] = useState([]);
  const [saleForm, setSaleForm] = useState({ productId: '', productName: '', qty: 1, sellPrice: '', costPrice: '', deductStock: false, notes: '' });
  const [saleSaving, setSaleSaving] = useState(false);
  const [offlineSales, setOfflineSales] = useState([]);

  // Expense form
  const [expForm, setExpForm] = useState({ description: '', amount: '', category: 'general', date: '' });
  const [expSaving, setExpSaving] = useState(false);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);
  useEffect(() => { adminGetProducts({ limit: 200 }).then((r) => setProducts(r.data.products || [])).catch(() => {}); }, []);

  const getParams = () => dateFrom && dateTo ? { dateFrom, dateTo } : { period };
  const load = async () => {
    setLoading(true);
    try {
      const [profitRes, salesRes, expRes] = await Promise.all([
        adminGetProfitReport(getParams()),
        adminGetOfflineSales(getParams()),
        adminGetExpenses(getParams()),
      ]);
      setData(profitRes.data);
      setOfflineSales(salesRes.data.sales || []);
      setExpenses(expRes.data.expenses || []);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [period]);

  const handleCustomRange = () => { if (dateFrom && dateTo) load(); };

  const handleProductSelect = (productId) => {
    const p = products.find((x) => x._id === productId);
    if (p) {
      setSaleForm({ ...saleForm, productId: p._id, productName: t(p.nameAr, p.nameEn), sellPrice: p.price, costPrice: p.costPrice || 0 });
    } else {
      setSaleForm({ ...saleForm, productId: '', productName: '', sellPrice: '', costPrice: '' });
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!saleForm.productName || !saleForm.qty || saleForm.sellPrice === '') return;
    setSaleSaving(true);
    try {
      await adminCreateOfflineSale(saleForm);
      setSaleForm({ productId: '', productName: '', qty: 1, sellPrice: '', costPrice: '', deductStock: false, notes: '' });
      load();
      toast.success('Offline sale recorded');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaleSaving(false); }
  };

  const handleDeleteSale = async (id) => {
    const ok = await confirm('Delete this sale?');
    if (!ok) return;
    try { await adminDeleteOfflineSale(id); load(); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expForm.description || !expForm.amount) return;
    setExpSaving(true);
    try {
      await adminCreateExpense(expForm);
      setExpForm({ description: '', amount: '', category: 'general', date: '' });
      load();
      toast.success('Expense added');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setExpSaving(false); }
  };

  const handleDeleteExpense = async (id) => {
    const ok = await confirm('Delete this expense?');
    if (!ok) return;
    try { await adminDeleteExpense(id); load(); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="profit" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        <h1 className="text-3xl font-black text-gray-900 mb-6">{ui.profitCenter}</h1>

        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: ui.today },
            { key: 'week', label: ui.thisWeek },
            { key: 'month', label: ui.thisMonth },
            { key: 'all', label: ui.allTime },
          ].map((p) => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setDateFrom(''); setDateTo(''); }}
              className={`h-10 px-5 rounded-xl text-sm font-black transition-all ${period === p.key && !dateFrom ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'}`}>
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
            <span className="text-gray-400 font-bold">-</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
            <button onClick={handleCustomRange}
              className="h-10 px-4 bg-pink-500 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all">Go</button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3">
          {[
            { key: 'overview', label: ui.overview },
            { key: 'offline', label: ui.offlineSales },
            { key: 'expenses', label: ui.expensesLabel },
            { key: 'transactions', label: ui.allTransactions },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`h-9 px-4 rounded-lg text-sm font-black transition-all ${tab === t.key ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">{ui.loading}</div>
        ) : data && (
          <>
            {/* ===== OVERVIEW TAB ===== */}
            {tab === 'overview' && (
              <>
                {/* Grand Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-black text-green-600 uppercase tracking-widest">{ui.netProfit}</p>
                      <p className="text-3xl font-black text-green-700">{data.grandTotal.netProfit} <span className="text-sm">EGP</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{ui.grossProfit}</p>
                      <p className="text-2xl font-black text-gray-900">{data.grandTotal.grossProfit} <span className="text-sm text-gray-500">EGP</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{ui.totalRevenue}</p>
                      <p className="text-2xl font-black text-gray-900">{data.grandTotal.totalRevenue} <span className="text-sm text-gray-500">EGP</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest">{ui.expensesLabel}</p>
                      <p className="text-2xl font-black text-red-500">{data.grandTotal.expenses} <span className="text-sm">EGP</span></p>
                    </div>
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Online */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{ui.onlineOrders}</h4>
                    <div className="space-y-2">
                      <Row label={ui.revenue} value={`${data.online.revenue} EGP`} />
                      <Row label={ui.cost} value={`${data.online.cost} EGP`} color="text-orange-500" />
                      <Row label={ui.productProfit} value={`${data.online.profit} EGP`} color="text-green-600" bold />
                      <Row label={ui.orders} value={data.online.ordersCount} />
                      <Row label={ui.itemsSold} value={data.online.itemsSold} />
                      <Row label={ui.discount} value={`-${data.online.discount} EGP`} color="text-red-500" />
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{ui.shipping}</h4>
                    <div className="space-y-2">
                      <Row label={ui.chargedToCustomers} value={`${data.online.shippingCharged} EGP`} />
                      <Row label={ui.actualCost} value={`${data.online.shippingActual} EGP`} color="text-orange-500" />
                      <Row label={ui.shippingProfit} value={`${data.online.shippingProfit} EGP`} color="text-green-600" bold />
                    </div>
                  </div>

                  {/* Offline */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{ui.offlineSales}</h4>
                    <div className="space-y-2">
                      <Row label={ui.revenue} value={`${data.offline.revenue} EGP`} />
                      <Row label={ui.cost} value={`${data.offline.cost} EGP`} color="text-orange-500" />
                      <Row label={ui.profit} value={`${data.offline.profit} EGP`} color="text-green-600" bold />
                      <Row label={ui.sales} value={data.offline.salesCount} />
                      <Row label={ui.itemsSold} value={data.offline.itemsSold} />
                    </div>
                  </div>
                </div>

                {/* Summary Formula */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">{ui.calculation}</h4>
                  <div className="space-y-1 text-sm font-bold">
                    <div className="flex justify-between"><span className="text-gray-600">{ui.onlineProductProfit}</span><span className="text-gray-900">+{data.online.profit} EGP</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">{ui.offlineProfit}</span><span className="text-gray-900">+{data.offline.profit} EGP</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">{ui.shippingProfit}</span><span className="text-gray-900">+{data.online.shippingProfit} EGP</span></div>
                    <div className="flex justify-between border-t border-gray-100 pt-1"><span className="text-gray-600">{ui.grossProfit}</span><span className="font-black text-gray-900">{data.grandTotal.grossProfit} EGP</span></div>
                    <div className="flex justify-between"><span className="text-red-500">{ui.expensesLabel}</span><span className="text-red-500">-{data.grandTotal.expenses} EGP</span></div>
                    <div className="flex justify-between border-t-2 border-green-200 pt-2"><span className="font-black text-green-700 text-base">{ui.netProfit}</span><span className="font-black text-green-700 text-lg">{data.grandTotal.netProfit} EGP</span></div>
                  </div>
                </div>
              </>
            )}

            {/* ===== OFFLINE SALES TAB ===== */}
            {tab === 'offline' && (
              <>
                <form onSubmit={handleAddSale} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                  <h3 className="text-lg font-black text-gray-900 mb-4">{ui.recordOfflineSale}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.product}</label>
                      <select value={saleForm.productId} onChange={(e) => handleProductSelect(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50">
                        <option value="">{ui.selectOrType}</option>
                        {products.map((p) => <option key={p._id} value={p._id}>{t(p.nameAr, p.nameEn)} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.productName}</label>
                      <input value={saleForm.productName} onChange={(e) => setSaleForm({ ...saleForm, productName: e.target.value })} required
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.quantity}</label>
                      <input type="number" min="1" value={saleForm.qty} onChange={(e) => setSaleForm({ ...saleForm, qty: Number(e.target.value) })} required
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.sellPrice}</label>
                      <input type="number" value={saleForm.sellPrice} onChange={(e) => setSaleForm({ ...saleForm, sellPrice: e.target.value })} required
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-pink-600 font-black text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.costPriceLabel}</label>
                      <input type="number" value={saleForm.costPrice} onChange={(e) => setSaleForm({ ...saleForm, costPrice: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-orange-400 outline-none text-orange-600 font-black text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.notes}</label>
                      <input value={saleForm.notes} onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={saleForm.deductStock} onChange={(e) => setSaleForm({ ...saleForm, deductStock: e.target.checked })}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 w-4 h-4" />
                      <span className="text-sm font-bold text-gray-700">{ui.deductFromStock}</span>
                    </label>
                    <button type="submit" disabled={saleSaving}
                      className="h-10 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {saleSaving ? ui.saving : ui.recordSale}
                    </button>
                  </div>
                </form>

                {/* Offline Sales List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-black text-gray-900">{ui.offlineSales}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {offlineSales.length === 0 && <div className="p-8 text-center text-gray-400 font-bold">{ui.noOfflineSales}</div>}
                    {offlineSales.map((s) => (
                      <div key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-black text-gray-900">{s.productName} <span className="text-gray-400 font-bold">x{s.qty}</span></p>
                          <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 mt-1">
                            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                            <span>Sell: {s.sellPrice} EGP</span>
                            <span>Cost: {s.costPrice} EGP</span>
                            <span className="text-green-600">Profit: {(s.sellPrice - s.costPrice) * s.qty} EGP</span>
                            {s.deductStock && <span className="text-pink-500">{ui.stockDeducted}</span>}
                            {s.notes && <span className="text-gray-400">{s.notes}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteSale(s._id)}
                          className="h-7 px-3 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 flex-shrink-0">{ui.delText}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== EXPENSES TAB ===== */}
            {tab === 'expenses' && (
              <>
                <form onSubmit={handleAddExpense} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                  <h3 className="text-lg font-black text-gray-900 mb-4">{ui.addExpense}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.expenseDesc}</label>
                      <input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} required
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" placeholder="e.g. Fabric purchase" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{`${ui.amount} (EGP)`}</label>
                      <input type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-red-400 outline-none text-red-600 font-black text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.expenseCategory}</label>
                      <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50">
                        <option value="general">{ui.catGeneral}</option>
                        <option value="materials">{ui.catMaterials}</option>
                        <option value="rent">{ui.catRent}</option>
                        <option value="tools">{ui.catTools}</option>
                        <option value="marketing">{ui.catMarketing}</option>
                        <option value="shipping">{ui.catShipping}</option>
                        <option value="other">{ui.catOther}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{ui.date}</label>
                      <input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" />
                    </div>
                  </div>
                  <button type="submit" disabled={expSaving}
                    className="h-10 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    {expSaving ? ui.saving : ui.addExpense}
                  </button>
                </form>

                {/* Expenses List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-black text-gray-900">{ui.expensesLabel}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {expenses.length === 0 && <div className="p-8 text-center text-gray-400 font-bold">{ui.noExpenses}</div>}
                    {expenses.map((e) => (
                      <div key={e._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-black text-gray-900">{e.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 mt-1">
                            <span>{new Date(e.date).toLocaleDateString()}</span>
                            <span className="text-pink-500 bg-pink-50 px-2 py-0.5 rounded">{e.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-red-500">-{e.amount} EGP</span>
                          <button onClick={() => handleDeleteExpense(e._id)}
                            className="h-7 px-3 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100">{ui.delText}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== TRANSACTIONS TAB ===== */}
            {tab === 'transactions' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-black text-gray-900">{ui.latestTransactions}</h3>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                        <th className="p-4">{ui.type}</th>
                        <th className="p-4">{ui.name}</th>
                        <th className="p-4">{ui.date}</th>
                        <th className="p-4">{ui.itemsSold}</th>
                        <th className="p-4">{ui.revenue}</th>
                        <th className="p-4">{ui.cost}</th>
                        <th className="p-4">{ui.shippingProfit}</th>
                        <th className="p-4">{ui.profit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((o) => (
                        <tr key={o._id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                          <td className="p-4">
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${o.type === 'online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                              {o.type === 'online' ? ui.online : ui.offline}
                            </span>
                          </td>
                          <td className="p-4 font-black text-gray-900">{o.name}</td>
                          <td className="p-4 text-gray-500 font-bold text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-gray-700 font-bold">{o.itemsSold}</td>
                          <td className="p-4 font-bold text-emerald-600">{o.revenue} EGP</td>
                          <td className="p-4 font-bold text-orange-500">{o.cost} EGP</td>
                          <td className="p-4 font-bold text-blue-500">{o.shippingProfit} EGP</td>
                          <td className="p-4">
                            <span className={`font-black text-base ${o.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {o.profit >= 0 ? '+' : ''}{o.profit} EGP
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="lg:hidden divide-y divide-gray-50">
                  {data.transactions.map((o) => (
                    <div key={o._id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${o.type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{o.type === 'online' ? ui.online : ui.offline}</span>
                          <p className="font-black text-gray-900">{o.name}</p>
                        </div>
                        <span className={`font-black text-base ${o.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {o.profit >= 0 ? '+' : ''}{o.profit} EGP
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span>Rev: {o.revenue}</span>
                        <span>Cost: {o.cost}</span>
                        {o.shippingProfit > 0 && <span className="text-blue-500">Ship: +{o.shippingProfit}</span>}
                        <span>{o.itemsSold} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 font-bold">{label}</span>
      <span className={`${bold ? 'font-black' : 'font-bold'} ${color || 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

AdminProfit.isAdmin = true;
