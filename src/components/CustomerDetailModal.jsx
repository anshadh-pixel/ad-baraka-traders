import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Calendar, 
  Package, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Send, 
  Edit3, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Share2, 
  Receipt,
  FileText,
  Check,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/haptics';
import { sendWhatsAppBill } from '../utils/whatsapp';

export default function CustomerDetailModal({
  customer,
  product,
  business,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onViewBill
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const currency = business?.currency || "₹";

  const balanceDue = Math.max(0, (Number(customer.totalAmount) || 0) - (Number(customer.collectedAmount) || 0));
  const isDelivered = customer.deliveryStatus === 'delivered';
  const isFullyPaid = balanceDue === 0 || customer.paymentStatus === 'paid';
  const rateDiff = (Number(customer.customRate) || 0) - (Number(product?.basePrice) || 0);

  const handleMarkDelivered = () => {
    triggerHaptic('success');
    onUpdateStatus({
      ...customer,
      deliveryStatus: 'delivered',
      deliveryDate: customer.deliveryDate || new Date().toISOString().split('T')[0]
    });
  };

  const handleMarkPaid = () => {
    triggerHaptic('success');
    // Launch celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onUpdateStatus({
      ...customer,
      paymentStatus: 'paid',
      collectedAmount: customer.totalAmount,
      paymentDate: customer.paymentDate || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto glass-panel bg-[#0d1322] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
      >
        {/* Top Handle / Modal Header */}
        <div className="sticky top-0 z-10 glass-panel bg-[#0d1322]/95 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-white text-base">Customer Order Details</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                onEdit(customer);
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400 hover:text-white transition-all active:scale-90"
              title="Edit Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('warning');
                if (window.confirm(`Delete customer order for "${customer.customerName}"?`)) {
                  onDelete(customer.id);
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-all active:scale-90"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4">
          {/* Customer Profile Card */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20">
                  {customer.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-white tracking-tight">
                    {customer.customerName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{customer.customerPlace || "No location set"}</span>
                  </div>
                </div>
              </div>

              {/* Direct Call / WhatsApp shortcuts */}
              {customer.customerPhone && (
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${customer.customerPhone}`}
                    className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 active:scale-90 transition-all"
                    title="Direct Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => sendWhatsAppBill({ customer, product, business })}
                    className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 active:scale-90 transition-all"
                    title="WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {customer.customerPhone && (
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Phone: <span className="text-slate-200 font-medium">{customer.customerPhone}</span></span>
                <span className="text-slate-400">Bill #: <span className="text-slate-200 font-mono">{customer.invoiceNumber || 'INV-001'}</span></span>
              </div>
            )}
          </div>

          {/* Pricing & Financial Summary (Big Visual Cards) */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total Bill */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Bill</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                {currency}{(customer.totalAmount || 0).toLocaleString()}
              </span>
            </div>

            {/* Collected */}
            <div className="p-3 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Collected</span>
              <span className="text-base font-extrabold text-emerald-300 mt-1 block">
                {currency}{(customer.collectedAmount || 0).toLocaleString()}
              </span>
            </div>

            {/* Balance Due */}
            <div className={`p-3 rounded-2xl border text-center ${
              balanceDue > 0
                ? 'bg-amber-500/[0.08] border-amber-500/30'
                : 'bg-slate-800/40 border-white/5'
            }`}>
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Balance Due</span>
              <span className={`text-base font-extrabold mt-1 block ${
                balanceDue > 0 ? 'text-amber-300' : 'text-slate-400'
              }`}>
                {balanceDue > 0 ? `${currency}${balanceDue.toLocaleString()}` : 'Nil (Paid)'}
              </span>
            </div>
          </div>

          {/* Product & Negotiated Price Details */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{product?.name || "Product"}</span>
              </div>
              <span className="text-slate-400">
                Quantity: <strong className="text-white font-bold">{customer.quantity || 1} {product?.unit || 'units'}</strong>
              </span>
            </div>

            {/* Rate Comparison Box */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Customer Agreed Special Rate
                </span>
                <div className="text-lg font-black text-emerald-300 mt-0.5">
                  {currency}{(customer.customRate || 0).toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {product?.unit || 'unit'}</span>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[11px]">Base Price: {currency}{Number(product?.basePrice || 0).toLocaleString()}</span>
                {rateDiff !== 0 && (
                  <span className={`font-semibold text-xs mt-0.5 block ${rateDiff < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {rateDiff < 0 ? `${currency}${Math.abs(rateDiff)} Discount` : `+${currency}${rateDiff} Premium`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Order Timeline */}
          <div className="glass-card rounded-2xl p-3.5 border border-white/10 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Dates & Timeline
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02]">
                <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Order Date</span>
                  <span className="font-semibold text-white">{customer.orderDate || "Not recorded"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02]">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Delivery Date</span>
                  <span className="font-semibold text-white">{customer.deliveryDate || "Not set"}</span>
                </div>
              </div>
            </div>

            {customer.notes && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300">
                <span className="text-[10px] text-slate-400 block font-semibold">Delivery Remarks / Notes:</span>
                <p className="mt-0.5 italic">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Quick Status Toggles (Delivery & Payment) */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Quick Status Actions
            </span>

            {/* Delivery Status Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 text-xs">
              {[
                { id: 'pending', label: '⏳ Pending' },
                { id: 'out_for_delivery', label: '🚚 On The Way' },
                { id: 'delivered', label: '✅ Delivered' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onUpdateStatus({
                      ...customer,
                      deliveryStatus: s.id,
                      deliveryDate: s.id === 'delivered' && !customer.deliveryDate 
                        ? new Date().toISOString().split('T')[0] 
                        : customer.deliveryDate
                    });
                  }}
                  className={`py-2 px-1 rounded-xl font-semibold transition-all text-center ${
                    customer.deliveryStatus === s.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Quick Mark Paid / Clear Balance Button */}
            {balanceDue > 0 ? (
              <button
                onClick={handleMarkPaid}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all glow-emerald"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Mark Full Payment Collected ({currency}{balanceDue.toLocaleString()})</span>
              </button>
            ) : (
              <div className="py-2 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All Payments Fully Collected!</span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* WhatsApp Bill Send Button (Vibrant & Highlighted) */}
            <button
              onClick={() => {
                triggerHaptic('success');
                sendWhatsAppBill({ customer, product, business });
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Send Bill via WhatsApp</span>
            </button>

            {/* View Full Digital Bill Receipt */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onViewBill(customer, product);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Receipt className="w-4 h-4 text-cyan-400" />
              <span>View & Print Detailed Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
