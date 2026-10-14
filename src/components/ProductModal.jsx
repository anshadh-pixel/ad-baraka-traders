import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useScrollLock } from '../utils/useScrollLock';

const COMMON_UNITS = ['Bag', 'kg', 'Piece', 'Box', 'Tin', 'Liter', 'Packet'];

export default function ProductModal({ isOpen, onClose, onSave, initialProduct, currency = "₹" }) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isEditing = Boolean(initialProduct && initialProduct.id);
  const [name, setName] = useState(initialProduct?.name || '');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice || '');
  const [unit, setUnit] = useState(initialProduct?.unit || 'Bag');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter product name");
      return;
    }
    if (!basePrice || Number(basePrice) < 0) {
      setError("Please enter a valid price");
      return;
    }

    onSave({
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      basePrice: Number(basePrice),
      unit: unit.trim() || 'Unit'
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs modal-backdrop overscroll-contain"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#162032] border border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in modal-content"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/80 bg-[#111827]">
          <h3 className="font-bold text-white text-base">
            {isEditing ? 'Edit Product' : 'Add New Product (പുതിയ പ്രോഡക്റ്റ്)'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Rice 25kg"
              className="biz-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Default Price ({currency}) *</label>
              <input
                type="number"
                step="any"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1750"
                className="biz-input font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="biz-input"
              >
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
