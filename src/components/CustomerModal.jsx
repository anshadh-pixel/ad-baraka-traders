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
  const [quantity, setQuantity] = useState(initialCustomer?.quantity !== undefined ? initialCustomer.quantity : 36);
  const [customRate, setCustomRate] = useState(
    initialCustomer?.customRate !== undefined 
      ? initialCustomer.customRate 
      : (initialCustomer?.price || product?.basePrice || 16)
  );
  const [isDelivered, setIsDelivered] = useState(
    initialCustomer?.isDelivered !== undefined ? Boolean(initialCustomer.isDelivered) : false
  );
  const [isCollected, setIsCollected] = useState(
    initialCustomer?.isCollected !== undefined ? Boolean(initialCustomer.isCollected) : false
  );
  const [error, setError] = useState('');

  const totalAmount = Math.max(0, (Number(quantity) || 0) * (Number(customRate) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter customer or shop name");
      return;
    }
    if (!customRate || Number(customRate) <= 0) {
      setError("Please enter a valid agreed price / rate");
      return;
    }

    onSave({
      id: initialCustomer?.id || `cust-${Date.now()}`,
      productId: product?.id || 'prod-1',
      customerName: customerName.trim(),
      customerPlace: customerPlace.trim(),
      customerPhone: customerPhone.trim(),
      quantity: Number(quantity) || 36,
      customRate: Number(customRate),
      price: Number(customRate),
      totalAmount,
      isDelivered,
      isCollected,
      bills: initialCustomer?.bills || [],
      payments: initialCustomer?.payments || []
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs modal-backdrop overscroll-contain"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#162032] border border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-[92vh] flex flex-col modal-content"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/80 bg-[#111827] shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter customer details matching your business sheet
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 modal-scrollable">
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
              placeholder="e.g. kalavar / skm / farm house"
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
                placeholder="e.g. kodanchery / kalpatta"
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

          {/* Qty & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quantity (Units) *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="36"
                className="biz-input font-bold text-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Price / Rate ({currency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                placeholder="16"
                className="biz-input font-bold text-blue-400 text-base"
              />
            </div>
          </div>

          {/* Total Amount Live Display */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Amount (Amt)</span>
            <span className="text-lg font-extrabold text-blue-400">
              {currency}{totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Status Checkboxes: Delivered & Amount Collected */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300 block">Status (Excel Column)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsDelivered(!isDelivered)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isDelivered 
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>{isDelivered ? '✅ Delivered' : '⏳ Delivery Pending'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCollected(!isCollected)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isCollected 
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <span>{isCollected ? '✅ Amount Collected' : '⏳ Amount Pending'}</span>
              </button>
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
              <span>{isEditing ? 'Save Changes' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
