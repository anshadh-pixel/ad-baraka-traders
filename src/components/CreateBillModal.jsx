import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, Calendar, User, MapPin } from 'lucide-react';
import { useScrollLock } from '../utils/useScrollLock';

export default function CreateBillModal({
  isOpen,
  onClose,
  onSaveBill,
  initialCustomer,
  customers = [],
  product,
  currency = "₹"
}) {
  useScrollLock(isOpen);

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomer?.id || (customers.length > 0 ? customers[0].id : '')
  );

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || initialCustomer;

  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(currentCustomer?.quantity || 36);
  const [rate, setRate] = useState(currentCustomer?.customRate || currentCustomer?.price || product?.basePrice || 16);
  const [paidAmount, setPaidAmount] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState('delivered');
  const [notes, setNotes] = useState('');
  const [isFullPaid, setIsFullPaid] = useState(true);

  // Sync state if customer changes
  useEffect(() => {
    if (currentCustomer) {
      const q = currentCustomer.quantity || 36;
      const r = currentCustomer.customRate || currentCustomer.price || product?.basePrice || 16;
      setQuantity(q);
      setRate(r);
      const total = (Number(q) || 0) * (Number(r) || 0);
      setPaidAmount(total);
      setIsFullPaid(true);
    }
  }, [selectedCustomerId]);

  if (!isOpen) return null;

  const totalAmount = Math.max(0, (Number(quantity) || 0) * (Number(rate) || 0));
  const balanceAmount = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  const handleSetFullPaid = () => {
    setPaidAmount(totalAmount);
    setIsFullPaid(true);
  };

  const handleSetZeroPaid = () => {
    setPaidAmount(0);
    setIsFullPaid(false);
  };

  const handleSubmit = (openPhoto = false) => {
    if (!currentCustomer) {
      alert("Please select a customer");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const billData = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      date: billDate,
      quantity: Number(quantity),
      rate: Number(rate),
      totalAmount,
      paidAmount: Number(paidAmount) || 0,
      balanceAmount,
      deliveryStatus,
      notes: notes.trim()
    };

    onSaveBill(billData, currentCustomer, openPhoto);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto modal-backdrop overscroll-contain"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#162032] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-fade-in flex flex-col max-h-[92vh] modal-content"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700 bg-[#111827]">
          <div>
            <h3 className="font-bold text-white text-base">
              Create Bill / Invoice (ബിൽ അടിക്കുക)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter customer, quantity and price to generate bill
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 modal-scrollable">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Customer *</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="biz-input font-bold"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customerName} {c.customerPlace ? `(${c.customerPlace})` : ''} - ₹{c.customRate || c.price || product?.basePrice}
                </option>
              ))}
            </select>
          </div>

          {/* Place & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Place / Town</label>
              <div className="biz-input bg-slate-900 text-xs py-2 text-slate-300 flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{currentCustomer?.customerPlace || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Bill Date *</span>
              </label>
              <input
                type="date"
                required
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="biz-input py-1.5"
              />
            </div>
          </div>

          {/* Quantity & Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantity(val);
                  if (isFullPaid) {
                    setPaidAmount((Number(val) || 0) * (Number(rate) || 0));
                  }
                }}
                className="biz-input font-bold text-base"
                placeholder="36"
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
                value={rate}
                onChange={(e) => {
                  const val = e.target.value;
                  setRate(val);
                  if (isFullPaid) {
                    setPaidAmount((Number(quantity) || 0) * (Number(val) || 0));
                  }
                }}
                className="biz-input font-bold text-blue-400 text-base"
                placeholder="16"
              />
            </div>
          </div>

          {/* Total Amount Live Banner */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bill Amount</span>
              <span className="text-xl font-extrabold text-white">
                {currency}{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span>{quantity} × {currency}{rate}</span>
            </div>
          </div>

          {/* Paid & Balance Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Amount Paid ({currency})</label>
                <button
                  type="button"
                  onClick={handleSetFullPaid}
                  className="text-[10px] text-blue-400 hover:underline font-bold"
                >
                  Full Paid
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={paidAmount}
                onChange={(e) => {
                  setPaidAmount(e.target.value);
                  setIsFullPaid(false);
                }}
                className="biz-input font-bold text-base"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Balance Due ({currency})</label>
                <button
                  type="button"
                  onClick={handleSetZeroPaid}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Nil Paid
                </button>
              </div>
              <div className={`biz-input bg-slate-900 font-extrabold text-base flex items-center justify-between py-2.5 ${
                balanceAmount > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                <span>{currency}{balanceAmount.toLocaleString()}</span>
                <span className="text-[10px] font-normal">
                  {balanceAmount === 0 ? 'Cleared' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Delivery Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryStatus('delivered')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  deliveryStatus === 'delivered'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✅ Delivered (സാധനം എത്തിച്ചു)
              </button>
              <button
                type="button"
                onClick={() => setDeliveryStatus('pending')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  deliveryStatus === 'pending'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ⏳ Delivery Pending (എത്തിക്കാനുണ്ട്)
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Notes / Remarks (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. delivered in morning, payment by cash"
              className="biz-input text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-[#111827] border-t border-slate-700/80 space-y-2">
          {/* High Priority: Bill Photo & WhatsApp */}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Generate Bill Photo & Send WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
