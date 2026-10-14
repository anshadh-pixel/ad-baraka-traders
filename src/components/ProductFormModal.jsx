import React, { useState } from 'react';
import { X, Package, Tag, Check, DollarSign, Layers, Palette } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const COMMON_UNITS = ['Bag', 'kg', 'Piece', 'Box', 'Tin', 'Liter', 'Packet', 'Bundle', 'Meter', 'Dozen'];
const COMMON_CATEGORIES = ['Rice & Grains', 'Oils', 'Spices', 'Beverages', 'Groceries', 'Hardware', 'Textiles', 'Other'];

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  initialProduct = null,
  business = {}
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialProduct && initialProduct.id);
  const currency = business?.currency || "₹";

  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Groceries');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice || '');
  const [unit, setUnit] = useState(initialProduct?.unit || 'Bag');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [color, setColor] = useState(initialProduct?.color || 'emerald');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerHaptic('medium');

    const newErrors = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!basePrice || Number(basePrice) < 0) newErrors.basePrice = "Please enter a valid base price";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerHaptic('warning');
      return;
    }

    const productData = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      basePrice: Number(basePrice),
      unit: unit.trim() || 'Unit',
      description: description.trim(),
      color,
      createdAt: initialProduct?.createdAt || new Date().toISOString()
    };

    onSave(productData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-panel bg-[#0d1322] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-panel bg-[#0d1322]/95 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-white text-base">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Product Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Biriyani Rice (25kg)"
              className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Category</span>
              </label>
              <input
                list="categories-list"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select or type..."
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              <datalist id="categories-list">
                {COMMON_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Default Unit</span>
              </label>
              <input
                list="units-list"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Bag / kg / Box"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              <datalist id="units-list">
                {COMMON_UNITS.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
          </div>

          {/* Standard Base Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Standard Base Price *</span>
              <span className="text-[10px] text-slate-400">Can be customized per customer</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1750"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl pl-8 pr-4 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            {errors.basePrice && <p className="text-[11px] text-rose-400">{errors.basePrice}</p>}
          </div>

          {/* Color Tag Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Color Theme</span>
            </label>
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { id: 'emerald', bg: 'bg-emerald-500' },
                { id: 'amber', bg: 'bg-amber-500' },
                { id: 'violet', bg: 'bg-purple-500' },
                { id: 'rose', bg: 'bg-rose-500' },
                { id: 'cyan', bg: 'bg-cyan-500' },
              ].map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-xl ${c.bg} transition-all ${
                    color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d1322] scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description / Specs</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 100% sortex clean, 2-year aged"
              className="w-full bg-[#121826] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Save Product Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
