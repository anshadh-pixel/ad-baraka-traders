import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Send, 
  PhoneCall, 
  Plus, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2, 
  Calendar,
  FileText,
  DollarSign,
  Image as ImageIcon,
  CreditCard
} from 'lucide-react';
import { getCustomerStats } from '../utils/storage';
import { sendBillOnWhatsApp } from '../utils/whatsapp';

export default function CustomerDetailView({
  customer,
  product,
  business,
  currency = "₹",
  onBack,
  onUpdateCustomer,
  onDeleteCustomer,
  onEditCustomerProfile,
  onOpenBillPhoto,
  onOpenPaymentModal
}) {
  const stats = getCustomerStats(customer);
  const bills = customer.bills || [];
  const payments = customer.payments || [];

  // New Bill Entry Form State
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(1);
  const [billRate, setBillRate] = useState(customer.customRate || product?.basePrice || 0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState('delivered');
  const [notes, setNotes] = useState('');
  const [isEditingAgreedRate, setIsEditingAgreedRate] = useState(false);
  const [newAgreedRate, setNewAgreedRate] = useState(customer.customRate || 0);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Live total calculations
  const billTotal = Math.max(0, (Number(quantity) || 1) * (Number(billRate) || 0));
  const billBalance = Math.max(0, billTotal - (Number(paidAmount) || 0));

  // Quick helper to fill full paid
  const handleSetFullPaid = () => {
    setPaidAmount(billTotal);
  };

  // Add New Bill handler
  const handleSaveBill = (openPhotoModal = false) => {
    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const newBill = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      date: billDate,
      quantity: Number(quantity),
      rate: Number(billRate),
      totalAmount: billTotal,
      paidAmount: Number(paidAmount) || 0,
      balanceAmount: billBalance,
      deliveryStatus: deliveryStatus,
      notes: notes.trim()
    };

    const updatedBills = [...bills, newBill];
    const updatedCustomer = {
      ...customer,
      bills: updatedBills
    };

    onUpdateCustomer(updatedCustomer);

    setFormSuccessMessage("Bill saved successfully!");
    setTimeout(() => setFormSuccessMessage(""), 2500);

    // Reset bill input defaults for next entry
    setQuantity(1);
    setPaidAmount(0);
    setNotes('');

    // If openPhotoModal requested, trigger photo modal!
    if (openPhotoModal) {
      onOpenBillPhoto(newBill, updatedCustomer, product);
    }
  };

  // Toggle delivery status of an existing bill
  const handleToggleBillDelivery = (billId) => {
    const updatedBills = bills.map(b => {
      if (b.id === billId) {
        return {
          ...b,
          deliveryStatus: b.deliveryStatus === 'delivered' ? 'pending' : 'delivered'
        };
      }
      return b;
    });

    onUpdateCustomer({
      ...customer,
      bills: updatedBills
    });
  };

  // Delete a specific bill
  const handleDeleteBill = (billId) => {
    if (window.confirm("Delete this bill?")) {
      const updatedBills = bills.filter(b => b.id !== billId);
      onUpdateCustomer({
        ...customer,
        bills: updatedBills
      });
    }
  };

  // Save new agreed base rate for this customer
  const handleSaveAgreedRate = () => {
    if (!newAgreedRate || Number(newAgreedRate) <= 0) return;
    onUpdateCustomer({
      ...customer,
      customRate: Number(newAgreedRate)
    });
    setBillRate(Number(newAgreedRate));
    setIsEditingAgreedRate(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditCustomerProfile(customer)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete customer ${customer.customerName} and all records?`)) {
                onDeleteCustomer(customer.id);
                onBack();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Customer Overview Card */}
      <div className="biz-card p-5 space-y-4">
        {/* Name, Place & Contact Actions */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {customer.customerName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              {customer.customerPlace && (
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.customerPlace}</span>
                </span>
              )}
              {customer.customerPhone && (
                <span>• 📞 {customer.customerPhone}</span>
              )}
            </div>
          </div>

          {/* Quick Call & WhatsApp Shortcuts */}
          {customer.customerPhone && (
            <div className="flex items-center gap-2">
              <a
                href={`tel:${customer.customerPhone}`}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                title="Direct Phone Call"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${customer.customerPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366]"
                title="Direct WhatsApp Chat"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Agreed Rate & Outstanding Balance Bar */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          {/* Agreed Rate */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Agreed Special Rate
            </span>
            {isEditingAgreedRate ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={newAgreedRate}
                  onChange={(e) => setNewAgreedRate(e.target.value)}
                  className="biz-input py-1 px-2 text-sm font-bold w-24"
                />
                <button
                  onClick={handleSaveAgreedRate}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-base font-extrabold text-blue-400">
                  {currency}{(customer.customRate || 0).toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-0.5">/{product?.unit || 'unit'}</span>
                </span>
                <button
                  onClick={() => setIsEditingAgreedRate(true)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Edit
                </button>
              </div>
            )}
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Base Price: {currency}{product?.basePrice}
            </span>
          </div>

          {/* Pending Balance Due & Record Payment Trigger */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Pending Due
              </span>
              <span className={`text-base font-extrabold mt-0.5 block ${
                stats.totalBalanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {stats.totalBalanceDue > 0 
                  ? `${currency}${stats.totalBalanceDue.toLocaleString()}` 
                  : 'All Paid (Nil)'}
              </span>
            </div>

            {/* Prominent "+ Record Payment" Button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenPaymentModal(customer, stats.totalBalanceDue)}
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Record Payment (തുക അടക്കുക)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Toggles: Delivered (In Customers) vs To Deliver (In Pending Orders) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Status Toggles (തത്സമയ അവസ്ഥ)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const nextDel = !customer.isDelivered;
                onUpdateCustomer({ ...customer, isDelivered: nextDel });
              }}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                customer.isDelivered
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-amber-600/20 border-amber-500 text-amber-300'
              }`}
            >
              {customer.isDelivered ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivered (In Customers)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>To Deliver (In Pending)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextCol = !customer.isCollected;
                onUpdateCustomer({ ...customer, isCollected: nextCol });
              }}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                customer.isCollected
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500 text-rose-300'
              }`}
            >
              {customer.isCollected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Amount Collected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Payment Due</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: ENTER NEW BILL / NEW ORDER (പുതിയ ബിൽ ചേർക്കുക) */}
      <div className="biz-card p-5 space-y-4 border border-blue-500/40 bg-[#131b2e]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Enter New Bill (പുതിയ ബിൽ അടിക്കുക)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Item: <span className="text-blue-400 font-semibold">{product?.name}</span>
            </p>
          </div>

          {formSuccessMessage && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              {formSuccessMessage}
            </span>
          )}
        </div>

        {/* Bill Entry Fields */}
        <div className="space-y-4">
          {/* Bill Date (Dedicated Full-Width Row to prevent iOS native date picker collision) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Bill Date *</span>
              <span className="text-[11px] text-slate-400">📅 Calendar</span>
            </label>
            <input
              type="date"
              required
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="biz-input w-full"
            />
          </div>

          {/* Quantity & Rate (Side-by-Side in 2 columns - short numbers, perfect fit!) */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-300 truncate block">
                Quantity ({product?.unit || 'units'}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="biz-input font-bold text-base w-full"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-300 truncate block">
                Rate / {product?.unit || 'unit'} ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={billRate}
                onChange={(e) => setBillRate(e.target.value)}
                className="biz-input font-bold text-blue-400 text-base w-full"
              />
            </div>
          </div>

          {/* Total Bill Amount Calculated Banner */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Total Bill Amount</label>
            <div className="biz-input bg-slate-900 font-extrabold text-white text-base flex items-center justify-between py-2.5">
              <span>{currency}{billTotal.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-normal">Calculated</span>
            </div>
          </div>

          {/* Paid Amount & Balance Due */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 truncate">Paid Now ({currency})</label>
                <button
                  type="button"
                  onClick={handleSetFullPaid}
                  className="text-[11px] text-blue-400 hover:underline font-bold flex-shrink-0 ml-1"
                >
                  Full Paid
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                className="biz-input font-bold text-base w-full"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-300 truncate block">Balance for this Bill</label>
              <div className={`biz-input bg-slate-900 font-extrabold text-base flex items-center justify-between py-2.5 ${
                billBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                <span>{currency}{billBalance.toLocaleString()}</span>
                <span className="text-[11px] font-normal">
                  {billBalance === 0 ? 'Cleared' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Status Selector */}
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

          {/* Remarks / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Remarks / Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. morning delivery, paid cash"
              className="biz-input text-xs"
            />
          </div>

          {/* Action Buttons: Save Bill & Open Bill Photo */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSaveBill(false)}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-blue-400" />
              <span>Save Bill</span>
            </button>

            {/* Bill Photo & WhatsApp Option */}
            <button
              type="button"
              onClick={() => handleSaveBill(true)}
              className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Save & Get Bill Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: PREVIOUS BILLS (കഴിഞ്ഞ ബില്ലുകൾ) */}
      <div className="biz-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white">
            Previous Bills (കഴിഞ്ഞ ബില്ലുകൾ)
          </h3>
          <span className="text-xs text-slate-400">
            {bills.length} {bills.length === 1 ? 'Bill' : 'Bills'}
          </span>
        </div>

        {bills.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No bills entered yet for this customer. Enter a bill above!
          </div>
        ) : (
          <div className="space-y-3">
            {[...bills].reverse().map(bill => (
              <div
                key={bill.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                {/* Bill Header: ID, Date & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{bill.id}</span>
                      <span className="text-xs text-slate-400">📅 {bill.date}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      <span>Quantity: <strong>{bill.quantity} {product?.unit || 'units'}</strong></span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span>Rate: {currency}{Number(bill.rate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white block">
                      {currency}{Number(bill.totalAmount).toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold block mt-0.5 ${
                      Number(bill.balanceAmount) > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {Number(bill.balanceAmount) > 0 ? `Due: ${currency}${Number(bill.balanceAmount).toLocaleString()}` : 'Fully Paid'}
                    </span>
                  </div>
                </div>

                {/* Delivery Status & Bill Photo / WhatsApp Actions */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleBillDelivery(bill.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      bill.deliveryStatus === 'delivered'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                    title="Click to toggle delivery status"
                  >
                    {bill.deliveryStatus === 'delivered' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Delivery Pending</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Bill Photo Generator Button */}
                    <button
                      onClick={() => onOpenBillPhoto(bill, customer, product)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 active:scale-95"
                      title="Generate and Share Bill Photo"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Bill Photo</span>
                    </button>

                    {/* Quick WhatsApp Share (Open WhatsApp directly) */}
                    <button
                      onClick={() => sendBillOnWhatsApp({
                        customer,
                        product,
                        bill,
                        business,
                        totalCustomerBalance: stats.totalBalanceDue,
                        useSpecificPhone: false // opens WhatsApp so user can pick ANY contact!
                      })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-bold border border-[#25D366]/30 active:scale-95"
                      title="Send WhatsApp text"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete Bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {bill.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: {bill.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: PAYMENT HISTORY (അടച്ച തുകകൾ) */}
      {payments.length > 0 && (
        <div className="biz-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payments Received (അടച്ച തുകകൾ)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              {payments.length} Payments
            </span>
          </div>

          <div className="space-y-2">
            {[...payments].reverse().map(p => (
              <div 
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-400 text-sm">
                    +{currency}{Number(p.amount).toLocaleString()}
                  </span>
                  <span className="text-slate-400 ml-2">via {p.mode}</span>
                  {p.notes && <span className="text-slate-500 block text-[11px] mt-0.5">{p.notes}</span>}
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
