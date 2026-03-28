import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetShippingZones, adminCreateShippingZone, adminUpdateShippingZone, adminDeleteShippingZone } from '@/lib/api';

export default function AdminShipping() {
  const { ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedZone, setExpandedZone] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [showAddGov, setShowAddGov] = useState(false);
  const [newGov, setNewGov] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCost, setNewAreaCost] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminGetShippingZones();
      setZones(r.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleAddGovernorate = async (e) => {
    e.preventDefault();
    if (!newGov.trim()) return;
    setSaving(true);
    try {
      await adminCreateShippingZone({ governorate: newGov.trim(), areas: [] });
      setNewGov('');
      setShowAddGov(false);
      load();
      toast.success('Governorate added');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDeleteZone = async (id) => {
    const ok = await confirm('Delete this governorate and all its areas?');
    if (!ok) return;
    try { await adminDeleteShippingZone(id); load(); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const handleAddArea = async (zone) => {
    if (!newAreaName.trim()) return;
    setSaving(true);
    try {
      const updatedAreas = [...zone.areas, { name: newAreaName.trim(), cost: Number(newAreaCost) || 0 }];
      await adminUpdateShippingZone(zone._id, { areas: updatedAreas });
      setNewAreaName('');
      setNewAreaCost('');
      load();
      toast.success('Area added');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleUpdateArea = async (zone, areaIndex, newName, newCost) => {
    setSaving(true);
    try {
      const updatedAreas = zone.areas.map((a, i) =>
        i === areaIndex ? { ...a, name: newName, cost: Number(newCost) || 0 } : a
      );
      await adminUpdateShippingZone(zone._id, { areas: updatedAreas });
      setEditingArea(null);
      load();
    } catch (err) { toast.error('Error updating area'); }
    finally { setSaving(false); }
  };

  const handleDeleteArea = async (zone, areaIndex) => {
    const ok = await confirm('Delete this area?');
    if (!ok) return;
    try {
      const updatedAreas = zone.areas.filter((_, i) => i !== areaIndex);
      await adminUpdateShippingZone(zone._id, { areas: updatedAreas });
      load();
      toast.success('Area deleted');
    } catch { toast.error('Error'); }
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="shipping" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">Shipping Zones</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">{zones.length} governorates</p>
          </div>
          <button onClick={() => setShowAddGov(true)}
            className="h-12 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.4)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap">
            + Add Governorate
          </button>
        </div>

        {showAddGov && (
          <form onSubmit={handleAddGovernorate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Governorate Name</label>
              <input value={newGov} onChange={(e) => setNewGov(e.target.value)} placeholder="e.g. القاهرة"
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-gray-50" required />
            </div>
            <button type="submit" disabled={saving} className="h-12 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">Save</button>
            <button type="button" onClick={() => setShowAddGov(false)} className="h-12 px-6 bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Loading...</div>
        ) : (
          <div className="space-y-4">
            {zones.map((zone) => {
              const isExpanded = expandedZone === zone._id;
              return (
                <div key={zone._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Governorate Header */}
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedZone(isExpanded ? null : zone._id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{isExpanded ? '▼' : '▶'}</span>
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{zone.governorate}</h3>
                        <p className="text-xs font-bold text-gray-400">{zone.areas.length} areas</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone._id); }}
                      className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">
                      Delete
                    </button>
                  </div>

                  {/* Areas List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5">
                      {zone.areas.length > 0 && (
                        <div className="mb-4">
                          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
                            <span className="col-span-5">Area</span>
                            <span className="col-span-3">Cost (EGP)</span>
                            <span className="col-span-4 text-right">Actions</span>
                          </div>
                          <div className="space-y-2">
                            {zone.areas.map((area, idx) => {
                              const isEditing = editingArea === `${zone._id}-${idx}`;
                              return (
                                <div key={area._id || idx}>
                                  {/* Desktop row */}
                                  <div className="hidden sm:grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-xl px-3 py-2.5">
                                    {isEditing ? (
                                      <EditAreaRow
                                        area={area}
                                        onSave={(name, cost) => handleUpdateArea(zone, idx, name, cost)}
                                        onCancel={() => setEditingArea(null)}
                                        saving={saving}
                                      />
                                    ) : (
                                      <>
                                        <span className="col-span-5 text-sm font-bold text-gray-900">{area.name}</span>
                                        <span className="col-span-3 text-sm font-black text-gray-700">{area.cost} EGP</span>
                                        <div className="col-span-4 flex gap-2 justify-end">
                                          <button onClick={() => setEditingArea(`${zone._id}-${idx}`)}
                                            className="h-7 px-3 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">Edit</button>
                                          <button onClick={() => handleDeleteArea(zone, idx)}
                                            className="h-7 px-3 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">Delete</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {/* Mobile card */}
                                  <div className="sm:hidden bg-gray-50 rounded-xl p-3">
                                    {isEditing ? (
                                      <EditAreaMobile
                                        area={area}
                                        onSave={(name, cost) => handleUpdateArea(zone, idx, name, cost)}
                                        onCancel={() => setEditingArea(null)}
                                        saving={saving}
                                      />
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-bold text-gray-900">{area.name}</p>
                                          <p className="text-xs font-black text-gray-500 mt-0.5">{area.cost} EGP</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                          <button onClick={() => setEditingArea(`${zone._id}-${idx}`)}
                                            className="h-7 px-2.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100">Edit</button>
                                          <button onClick={() => handleDeleteArea(zone, idx)}
                                            className="h-7 px-2.5 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100">Del</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add Area */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-3 border-t border-gray-100">
                        <div className="flex-1">
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Area</label>
                          <input value={expandedZone === zone._id ? newAreaName : ''} onChange={(e) => setNewAreaName(e.target.value)} placeholder="Area name"
                            className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
                        </div>
                        <div className="w-full sm:w-32">
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cost</label>
                          <input type="number" value={expandedZone === zone._id ? newAreaCost : ''} onChange={(e) => setNewAreaCost(e.target.value)} placeholder="0"
                            className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
                        </div>
                        <button onClick={() => handleAddArea(zone)} disabled={saving}
                          className="h-10 px-5 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 whitespace-nowrap w-full sm:w-auto">
                          + Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EditAreaMobile({ area, onSave, onCancel, saving }) {
  const [name, setName] = useState(area.name);
  const [cost, setCost] = useState(area.cost);
  return (
    <div className="space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border-2 border-pink-300 outline-none text-gray-900 font-bold text-sm bg-white" />
      <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost"
        className="w-full h-9 px-3 rounded-lg border-2 border-pink-300 outline-none text-gray-900 font-bold text-sm bg-white" />
      <div className="flex gap-2">
        <button onClick={() => onSave(name, cost)} disabled={saving}
          className="flex-1 h-8 rounded-lg bg-green-50 text-green-600 text-xs font-black hover:bg-green-100 border border-green-100 disabled:opacity-50">Save</button>
        <button onClick={onCancel}
          className="flex-1 h-8 rounded-lg bg-gray-100 text-gray-600 text-xs font-black hover:bg-gray-200">Cancel</button>
      </div>
    </div>
  );
}

function EditAreaRow({ area, onSave, onCancel, saving }) {
  const [name, setName] = useState(area.name);
  const [cost, setCost] = useState(area.cost);
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="col-span-5 h-8 px-2 rounded-lg border-2 border-pink-300 outline-none text-gray-900 font-bold text-sm bg-white" />
      <input type="number" value={cost} onChange={(e) => setCost(e.target.value)}
        className="col-span-3 h-8 px-2 rounded-lg border-2 border-pink-300 outline-none text-gray-900 font-bold text-sm bg-white" />
      <div className="col-span-4 flex gap-2 justify-end">
        <button onClick={() => onSave(name, cost)} disabled={saving}
          className="h-7 px-3 rounded-lg bg-green-50 text-green-600 text-xs font-black hover:bg-green-100 border border-green-100 transition-colors disabled:opacity-50">Save</button>
        <button onClick={onCancel}
          className="h-7 px-3 rounded-lg bg-gray-100 text-gray-600 text-xs font-black hover:bg-gray-200 transition-colors">Cancel</button>
      </div>
    </>
  );
}

AdminShipping.isAdmin = true;
