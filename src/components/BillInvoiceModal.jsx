import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Store, 
  Calendar, 
  MapPin, 
  Phone,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sendWhatsAppBill, generateInvoiceText } from '../utils/whatsapp';

export default function BillInvoiceModal({
  customer,
  product,
  business,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const currency = business?.currency || "₹";

  const balanceDue = Math.max(0, (Number(customer.totalAmount) || 0) - (Number(customer.collectedAmount) || 0));
  const invoiceNumber = customer.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const handleCopy = () => {
    triggerHaptic('medium');
    const text = generateInvoiceText({ customer, product, business });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[94vh] overflow-y-auto glass-panel bg-[#0d1322] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-10 glass-panel bg-[#0d1322]/95 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-white text-base">Digital Tax Invoice</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
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
        </div>

        {/* Printable Invoice Card */}
        <div className="p-5 space-y-4">
          <div id="printable-receipt" className="bg-[#121826] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* Business Header */}
            <div className="text-center space-y-1 pt-1 pb-3 border-b border-dashed border-white/15">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-2">
                {business?.name || "OFFICIAL BUSINESS"}
              </h2>
              {business?.tagline && (
                <p className="text-[11px] text-slate-400 italic">{business.tagline}</p>
              )}
              <div className="text-xs text-slate-400 flex items-center justify-center gap-2 flex-wrap">
                {business?.place && <span>📍 {business.place}</span>}
                {business?.phone && <span>📞 {business.phone}</span>}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Number</span>
                <span className="font-mono font-bold text-white text-xs">{invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-semibold text-white text-xs">{customer.orderDate || new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Billed To Customer */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Billed To</span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{customer.customerName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{customer.customerPlace || "N/A"}</span>
                  </div>
                </div>
                {customer.customerPhone && (
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{customer.customerPhone}</span>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Item Details</span>
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-white/[0.04] p-2.5 font-bold text-slate-300 text-[11px] border-b border-white/5">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-3 text-center">Rate</div>
                  <div className="col-span-3 text-right">Amount</div>
                </div>

                {/* Table Row */}
                <div className="grid grid-cols-12 p-3 items-center text-xs">
                  <div className="col-span-6 font-semibold text-white">
                    {product?.name || "Product Item"}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Qty: {customer.quantity || 1} {product?.unit || 'units'}
                    </span>
                  </div>
                  <div className="col-span-3 text-center text-emerald-400 font-semibold">
                    {currency}{(customer.customRate || 0).toLocaleString()}
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-white">
                    {currency}{(customer.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="space-y-1.5 pt-1 text-xs border-t border-white/10">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{currency}{(customer.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Amount Paid</span>
                <span>{currency}{(customer.collectedAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-white/15">
                <span className="text-white">BALANCE DUE</span>
                <span className={`text-base ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {balanceDue > 0 ? `${currency}${balanceDue.toLocaleString()}` : `${currency}0 (Nil)`}
                </span>
              </div>
            </div>

            {/* Delivery & UPI Instructions */}
            <div className="pt-2 border-t border-dashed border-white/15 flex items-center justify-between text-[11px] text-slate-400">
              <div>
                <span>Delivery: </span>
                <span className="font-semibold text-slate-200 capitalize">
                  {customer.deliveryStatus === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                </span>
              </div>
              {business?.upiId && (
                <div className="text-right">
                  <span>Pay via UPI: </span>
                  <span className="font-mono text-emerald-400 font-bold">{business.upiId}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-500 italic">
              Thank you for doing business with us! This is a computer-generated digital receipt.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                triggerHaptic('success');
                sendWhatsAppBill({ customer, product, business });
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Send this Bill via WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Invoice Text Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copy Formatted Bill Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
