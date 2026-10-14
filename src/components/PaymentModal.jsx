import React, { useState } from 'react';
import { X, Check, DollarSign, Send, CreditCard, Calendar } from 'lucide-react';
import { useScrollLock } from '../utils/useScrollLock';

export default function PaymentModal({
  isOpen,
  onClose,
  onSavePayment,
  customer,
  currentDue = 0,
  currency = "₹",
  business
}) {
  // Lock body scroll behind modal
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const numAmount = Number(amount) || 0;
  const remainingDue = Math.max(0, currentDue - numAmount);

  const handleSubmit = (sendWhatsApp = false) => {
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    const paymentData = {
      amount: numAmount,
      date,
      mode,
      notes: notes.trim()
    };

    onSavePayment(paymentData);

    if (sendWhatsApp) {
      // Send WhatsApp payment receipt (without forcing number, user picks ANY customer in WhatsApp!)
      const receiptText = [
        `🧾 *PAYMENT RECEIPT - ${business?.name || 'BUSINESS'}*`,
        `--------------------------------`,
        `👤 *Customer:* ${customer?.customerName}`,
        customer?.customerPlace ? `📍 *Place:* ${customer.customerPlace}` : null,
        `📅 *Date:* ${date}`,
        `💰 *Amount Received:* ${currency}${numAmount.toLocaleString()} (${mode})`,
        `--------------------------------`,
        `📌 *PREVIOUS DUE:* ${currency}${currentDue.toLocaleString()}`,
        `📌 *REMAINING BALANCE DUE:* *${currency}${remainingDue.toLocaleString()}*`,
        notes ? `📝 *Note:* ${notes}` : null,
        `--------------------------------`,
        `_Thank you for your payment!_ 🙏`
      ].filter(Boolean).join('\n');

      const encoded = encodeURIComponent(receiptText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs modal-backdrop overscroll-contain"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#162032] border border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-[92vh] flex flex-col modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700 bg-[#111827] shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">
              Record Payment (പെയ്‌മെന്റ് അടക്കുക)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: <span className="text-blue-400 font-semibold">{customer?.customerName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 modal-scrollable">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Current Pending Due Display */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Current Pending Due
              </span>
              <span className="text-lg font-black text-amber-400 mt-0.5 block">
                {currency}{currentDue.toLocaleString()}
              </span>
            </div>

            {currentDue > 0 && (
              <button
                type="button"
                onClick={() => setAmount(currentDue.toString())}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/30"
              >
                Clear Full Due
              </button>
            )}
          </div>

          {/* Amount Received Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Amount Received ({currency}) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="biz-input font-black text-lg text-emerald-400"
            />

            {/* Quick Amount Suggestion Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[500, 1000, 2000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Date Received</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="biz-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Payment Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="biz-input text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="GPay / UPI">GPay / UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Remarks / Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Part payment received via GPay"
              className="biz-input text-xs"
            />
          </div>

          {/* Remaining Due Preview */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Balance Due After Payment:</span>
            <span className={`font-bold text-sm ${remainingDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currency}{remainingDue.toLocaleString()} {remainingDue === 0 ? '(All Cleared!)' : ''}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Payment</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Save & WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
