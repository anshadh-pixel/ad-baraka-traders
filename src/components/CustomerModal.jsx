import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useScrollLock } from '../utils/useScrollLock';

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  initialCustomer, 
  currency = "₹" 
}) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isEditing = Boolean(initialCustomer && initialCustomer.id);
  const [customerName, setCustomerName] = useState(initialCustomer?.customerName || '');
  const [customerPlace, setCustomerPlace] = useState(initialCustomer?.customerPlace || '');
  const [customerPhone, setCustomerPhone] = useState(initialCustomer?.customerPhone || '');
  const [customRate, setCustomRate] = useState(
    initialCustomer?.customRate !== undefined ? initialCustomer.customRate : (product?.basePrice || '')
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter customer or shop name");
      return;
    }
    if (!customRate || Number(customRate) <= 0) {
      setError("Please enter a valid agreed rate");
      return;
    }

    onSave({
      id: initialCustomer?.id || `cust-${Date.now()}`,
      productId: product.id,
      customerName: customerName.trim(),
      customerPlace: customerPlace.trim(),
      customerPhone: customerPhone.trim(),
      customRate: Number(customRate),
      bills: initialCustomer?.bills || [],
      payments: initialCustomer?.payments || []
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs modal-backdrop overscroll-contain"
      onClick={onClose}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#162032] border border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col modal-content"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/80 bg-[#111827] shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">
              {isEditing ? 'Edit Customer' : 'Add Customer for this Product'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Product: <span className="text-blue-400 font-semibold">{product?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Customer / Shop Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahim Hotel / Anoop Stores"
              className="biz-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Place / Town</label>
              <input
                type="text"
                value={customerPlace}
                onChange={(e) => setCustomerPlace(e.target.value)}
                placeholder="e.g. Calicut"
                className="biz-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">WhatsApp Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9847123456"
                className="biz-input"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Agreed Special Rate ({currency} / {product?.unit || 'unit'}) *
              </label>
              <span className="text-[11px] text-slate-400">
                Default: {currency}{product?.basePrice}
              </span>
            </div>
            <input
              type="number"
              step="any"
              required
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              placeholder={product?.basePrice?.toString()}
              className="biz-input font-bold text-blue-400 text-base"
            />
            <p className="text-[11px] text-slate-400">
              Each customer can have their own negotiated price for this product.
            </p>
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
              <span>{isEditing ? 'Save Customer' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
