import React, { useState } from 'react';
import { 
  X, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Check, 
  ShieldCheck,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { exportBackupJSON, importBackupJSON, resetToDemoData, clearAllData } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  business,
  onSaveBusiness,
  onDataResetOrImport
}) {
  if (!isOpen) return null;

  const [name, setName] = useState(business?.name || '');
  const [owner, setOwner] = useState(business?.owner || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [place, setPlace] = useState(business?.place || '');
  const [currency, setCurrency] = useState(business?.currency || '₹');
  const [upiId, setUpiId] = useState(business?.upiId || '');
  const [tagline, setTagline] = useState(business?.tagline || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    triggerHaptic('medium');

    const updated = {
      ...business,
      name: name.trim() || 'My Business',
      owner: owner.trim(),
      phone: phone.trim(),
      place: place.trim(),
      currency: currency.trim() || '₹',
      upiId: upiId.trim(),
      tagline: tagline.trim()
    };

    onSaveBusiness(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleExport = () => {
    triggerHaptic('success');
    exportBackupJSON();
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      triggerHaptic('medium');
      const data = await importBackupJSON(file);
      onDataResetOrImport(data);
      setImportStatus('✅ Backup restored successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      triggerHaptic('warning');
      setImportStatus('❌ Error restoring backup file.');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm("Reload default sample business products and customers?")) {
      triggerHaptic('medium');
      const data = resetToDemoData();
      onDataResetOrImport(data);
      onClose();
    }
  };

  const handleClearAll = () => {
    if (window.confirm("WARNING: Clear all products and customers? This cannot be undone.")) {
      triggerHaptic('warning');
      const data = clearAllData();
      onDataResetOrImport(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto glass-panel bg-[#0d1322] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-panel bg-[#0d1322]/95 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Business & App Settings</h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Business Details Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block">
              Business Profile (Used in Bills & Invoices)
            </span>

            {/* Shop Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Business / Store Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Al-Baraka General Traders"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Owner & Phone */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Owner Name</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. Shafi"
                  className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9847123456"
                  className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Place & Currency */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">City / Place</label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. Calicut, Kerala"
                  className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="₹"
                  className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2 text-sm text-white text-center font-bold focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* UPI ID */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">UPI ID (For Customer Payments)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Wholesale & Custom Distribution"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Save Profile Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Business Profile Saved!</span>
                </>
              ) : (
                <span>Save Business Profile</span>
              )}
            </button>
          </form>

          {/* Storage & Backup Section (Requirement #3) */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="text-xs uppercase font-bold text-white tracking-wider">
                Phone Storage & Data Backup
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              All your products and customer prices are automatically saved in your phone's local storage. You can also export a copy to your phone files anytime!
            </p>

            {importStatus && (
              <p className="text-xs font-bold text-emerald-300 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                {importStatus}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Export Backup */}
              <button
                type="button"
                onClick={handleExport}
                className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup</span>
              </button>

              {/* Import Backup */}
              <label className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Data Reset Actions */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResetDemo}
              className="text-slate-400 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Sample Data</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
