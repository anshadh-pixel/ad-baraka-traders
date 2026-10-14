import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Tag, 
  Calendar, 
  Package, 
  Check, 
  DollarSign, 
  FileText,
  Truck,
  CreditCard
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSave,
  initialCustomer = null,
  products = [],
  defaultProduct = null,
  business = {}
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialCustomer && initialCustomer.id);
  const currency = business?.currency || "₹";

  const [productId, setProductId] = useState(
    initialCustomer?.productId || defaultProduct?.id || (products[0] ? products[0].id : '')
  );
  const [customerName, setCustomerName] = useState(initialCustomer?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialCustomer?.customerPhone || '');
  const [customerPlace, setCustomerPlace] = useState(initialCustomer?.customerPlace || '');
  
  // Custom rate: if adding, prefill with selected product's base price
  const selectedProduct = products.find(p => p.id === productId) || defaultProduct || {};
  const [customRate, setCustomRate] = useState(
    initialCustomer?.customRate !== undefined 
      ? initialCustomer.customRate 
      : (selectedProduct.basePrice || 0)
  );

  const [quantity, setQuantity] = useState(initialCustomer?.quantity || 1);
  const [collectedAmount, setCollectedAmount] = useState(initialCustomer?.collectedAmount || 0);
  const [deliveryStatus, setDeliveryStatus] = useState(initialCustomer?.deliveryStatus || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(initialCustomer?.paymentStatus || 'unpaid');
  const [orderDate, setOrderDate] = useState(
    initialCustomer?.orderDate || new Date().toISOString().split('T')[0]
  );
  const [deliveryDate, setDeliveryDate] = useState(initialCustomer?.deliveryDate || '');
  const [paymentMode, setPaymentMode] = useState(initialCustomer?.paymentMode || 'GPay / UPI');
  const [notes, setNotes] = useState(initialCustomer?.notes || '');
  const [errors, setErrors] = useState({});

  // When product changes in Add mode, update customRate to that product's basePrice if not manually set
  const handleProductChange = (newProdId) => {
    setProductId(newProdId);
    if (!isEditing) {
      const prod = products.find(p => p.id === newProdId);
      if (prod) {
        setCustomRate(prod.basePrice);
      }
    }
  };

  // Live computed total
  const totalAmount = Math.max(0, (Number(customRate) || 0) * (Number(quantity) || 1));
  const balanceDue = Math.max(0, totalAmount - (Number(collectedAmount) || 0));

  // Sync payment status when collected amount changes
  const handleCollectedChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    setCollectedAmount(num);
    if (num >= totalAmount && totalAmount > 0) {
      setPaymentStatus('paid');
    } else if (num > 0) {
      setPaymentStatus('partial');
    } else {
      setPaymentStatus('unpaid');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerHaptic('medium');

    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!productId) newErrors.productId = "Please select a product";
    if (Number(customRate) <= 0) newErrors.customRate = "Please enter a valid rate";
    if (Number(quantity) <= 0) newErrors.quantity = "Quantity must be at least 1";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerHaptic('warning');
      return;
    }

    const customerData = {
      id: initialCustomer?.id || `cust-${Date.now()}`,
      productId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerPlace: customerPlace.trim(),
      customRate: Number(customRate),
      quantity: Number(quantity),
      totalAmount,
      collectedAmount: Number(collectedAmount),
      deliveryStatus,
      paymentStatus: Number(collectedAmount) >= totalAmount ? 'paid' : Number(collectedAmount) > 0 ? 'partial' : 'unpaid',
      orderDate,
      deliveryDate: deliveryDate || null,
      paymentDate: Number(collectedAmount) > 0 ? (initialCustomer?.paymentDate || orderDate) : null,
      paymentMode,
      notes: notes.trim(),
      invoiceNumber: initialCustomer?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      updatedAt: new Date().toISOString()
    };

    onSave(customerData);
    onClose();
  };

  const rateDiff = (Number(customRate) || 0) - (Number(selectedProduct.basePrice) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto glass-panel bg-[#0d1322] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-panel bg-[#0d1322]/95 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-white text-base">
              {isEditing ? 'Edit Customer & Pricing' : 'Add Customer with Custom Rate'}
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
          {/* Product Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Product Item</span>
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} (Base: {currency}{Number(p.basePrice).toLocaleString()}/{p.unit})
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-[11px] text-rose-400">{errors.productId}</p>}
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customer / Shop Name *</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahim Stores / Anoop"
              className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {errors.customerName && <p className="text-[11px] text-rose-400">{errors.customerName}</p>}
          </div>

          {/* Place & Phone */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Place / Location</span>
              </label>
              <input
                type="text"
                value={customerPlace}
                onChange={(e) => setCustomerPlace(e.target.value)}
                placeholder="e.g. Calicut / Kochi"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Phone</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9847012345"
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Negotiated Custom Rate & Quantity (Highlight Box) */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Agreed Rate</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Base: {currency}{Number(selectedProduct.basePrice || 0).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Rate per unit */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Rate / {selectedProduct.unit || 'unit'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="w-full bg-[#0d1322] border border-emerald-500/40 rounded-xl pl-7 pr-3 py-2 text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                {rateDiff !== 0 && (
                  <span className={`text-[10px] font-semibold ${rateDiff < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {rateDiff < 0 ? `-${currency}${Math.abs(rateDiff)} vs base` : `+${currency}${rateDiff} vs base`}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Quantity</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#0d1322] border border-white/15 rounded-xl px-3 py-2 text-sm font-bold text-white text-center focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Total Calculation Display */}
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Calculated Total Bill:</span>
              <span className="text-base font-extrabold text-white">
                {currency}{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dates Setup (Requirement #5: "oro custemer product add cheyyunnadhum date setup venam") */}
          <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Date Setup</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Order Date */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Order Date *</label>
                <input
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Delivery Date */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Expected Delivery</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Payment Status Settings */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Delivery Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Status</span>
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="pending" className="bg-slate-900">⏳ Pending</option>
                <option value="out_for_delivery" className="bg-slate-900">🚚 Out for Delivery</option>
                <option value="delivered" className="bg-slate-900">✅ Delivered</option>
                <option value="cancelled" className="bg-slate-900">❌ Cancelled</option>
              </select>
            </div>

            {/* Payment Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Mode</span>
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="GPay / UPI" className="bg-slate-900">GPay / UPI</option>
                <option value="Cash" className="bg-slate-900">Cash</option>
                <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                <option value="Credit" className="bg-slate-900">Credit (Pending)</option>
              </select>
            </div>
          </div>

          {/* Payment Collected & Balance Tracking */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Payment Collected</label>
              <button
                type="button"
                onClick={() => handleCollectedChange(totalAmount)}
                className="text-[10px] font-bold text-emerald-400 hover:underline"
              >
                Mark Full Paid
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                value={collectedAmount}
                onChange={(e) => handleCollectedChange(e.target.value)}
                placeholder="0"
                className="w-full bg-[#121826] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Balance Due:</span>
              <span className={`font-bold ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currency}{balanceDue.toLocaleString()} {balanceDue === 0 ? '(Cleared)' : ''}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Delivery Remarks</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. deliver to back gate, morning 10am"
              className="w-full bg-[#121826] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Save Changes' : 'Add Customer & Save Rate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
