import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  MapPin, 
  Phone, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Edit2, 
  Trash2, 
  Tag, 
  PackageCheck, 
  Check, 
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { getCustomerStats } from '../utils/storage';

export default function ProductCustomersView({
  product,
  customers,
  currency = "₹",
  onBack,
  onSelectCustomer,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onToggleDelivery,
  onToggleCollected,
  onOpenCreateBill
}) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending_del', 'pending_pay', 'delivered', 'collected'

  // Only customers who buy this specific product
  const productCustomers = customers.filter(c => c.productId === product.id);

  // Totals calculated like Excel sheet
  const totalCustomers = productCustomers.length;
  const totalAmountSum = productCustomers.reduce((sum, c) => {
    const qty = Number(c.quantity) || 36;
    const rate = Number(c.customRate || c.price) || 0;
    return sum + (Number(c.totalAmount) || (qty * rate));
  }, 0);

  const deliveredCount = productCustomers.filter(c => c.isDelivered).length;
  const pendingDelCount = totalCustomers - deliveredCount;

  const collectedCount = productCustomers.filter(c => c.isCollected).length;
  const collectedAmount = productCustomers.reduce((sum, c) => {
    if (c.isCollected) {
      const qty = Number(c.quantity) || 36;
      const rate = Number(c.customRate || c.price) || 0;
      return sum + (Number(c.totalAmount) || (qty * rate));
    }
    return sum;
  }, 0);
  const pendingAmount = totalAmountSum - collectedAmount;

  // Filter logic
  const filtered = productCustomers.filter(c => {
    // Search match
    const q = search.toLowerCase().trim();
    const nameMatch = c.customerName.toLowerCase().includes(q);
    const placeMatch = c.customerPlace && c.customerPlace.toLowerCase().includes(q);
    const phoneMatch = c.customerPhone && c.customerPhone.includes(q);
    const matchesSearch = !q || nameMatch || placeMatch || phoneMatch;

    if (!matchesSearch) return false;

    if (filterTab === 'pending_del') return !c.isDelivered;
    if (filterTab === 'delivered') return c.isDelivered;
    if (filterTab === 'pending_pay') return !c.isCollected;
    if (filterTab === 'collected') return c.isCollected;
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Navigation */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Products</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Separate Bill Action Button */}
            <button
              onClick={() => onOpenCreateBill(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
              title="Create a new bill or invoice"
            >
              <Receipt className="w-4 h-4" />
              <span>+ Create Bill</span>
            </button>

            {/* Add Customer Button */}
            <button
              onClick={() => onAddCustomer(product)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Excel Summary Banner (Matches Excel Columns & Totals) */}
        <div className="biz-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Route Sales Summary (ഡാറ്റാ സംഗ്രഹം)
              </span>
              <h2 className="text-base font-extrabold text-white">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Route Value
              </span>
              <span className="text-lg font-black text-white">
                {currency}{totalAmountSum.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 4 Stat Badges matching Excel columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
            {/* 1. Total Customers */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Customers</span>
              <span className="text-sm font-extrabold text-white mt-0.5 block">
                {totalCustomers} Shops
              </span>
            </div>

            {/* 2. Delivered Status */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Delivered</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block flex items-center gap-1">
                <span>{deliveredCount} / {totalCustomers}</span>
                {pendingDelCount > 0 && (
                  <span className="text-[10px] text-amber-400 font-normal">({pendingDelCount} left)</span>
                )}
              </span>
            </div>

            {/* 3. Amount Collected */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Collected</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                {currency}{collectedAmount.toLocaleString()}
              </span>
            </div>

            {/* 4. Amount Pending */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Pending Due</span>
              <span className={`text-sm font-extrabold mt-0.5 block ${pendingAmount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {pendingAmount > 0 ? `${currency}${pendingAmount.toLocaleString()}` : 'Nil (All Paid)'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            All ({totalCustomers})
          </button>

          <button
            onClick={() => setFilterTab('pending_del')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'pending_del'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>To Deliver ({pendingDelCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('pending_pay')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'pending_pay'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Payment Due ({totalCustomers - collectedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('delivered')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'delivered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered ({deliveredCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('collected')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'collected'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Paid ({collectedCount})</span>
          </button>
        </div>

        {/* Search Bar with Fixed Padding & Dedicated Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name or place..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            className="biz-input search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all z-10"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Cards List */}
      {filtered.length === 0 ? (
        <div className="biz-card p-8 text-center space-y-3 mt-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Tag className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Customers Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search 
                ? `No customers match "${search}".` 
                : "No customers match the selected filter."}
            </p>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(customer => {
            const qty = Number(customer.quantity) || 36;
            const price = Number(customer.customRate || customer.price) || 0;
            const amt = Number(customer.totalAmount) || (qty * price);
            const isDel = Boolean(customer.isDelivered);
            const isCol = Boolean(customer.isCollected);

            return (
              <div
                key={customer.id}
                className="biz-card p-4 space-y-3 relative transition-all border border-slate-800"
              >
                {/* Row 1: Name, Place & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-white tracking-tight capitalize">
                      {customer.customerName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      {customer.customerPlace && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="capitalize">{customer.customerPlace}</span>
                        </span>
                      )}
                      {customer.customerPhone && (
                        <span className="text-slate-400">
                          • 📞 {customer.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Action Icons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Quick WhatsApp or Call if phone exists */}
                    {customer.customerPhone && (
                      <a
                        href={`https://wa.me/${customer.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30"
                        title="Chat on WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      title="Edit customer details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete customer "${customer.customerName}"?`)) {
                          onDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-rose-500/20"
                      title="Delete customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: The Excel Metrics Grid (Qty, Price, Amt) */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Quantity (Qty)
                    </span>
                    <span className="text-sm font-extrabold text-white mt-0.5 block">
                      {qty}
                    </span>
                  </div>

                  <div className="border-x border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Price / Rate
                    </span>
                    <span className="text-sm font-extrabold text-blue-400 mt-0.5 block">
                      {currency}{price}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Amt
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      {currency}{amt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Row 3: 1-Tap Excel Status Toggles (Delivered ✓ and Amount Collected ✓) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* 1-Tap Delivered Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleDelivery(customer.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isDel
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    }`}
                    title="Click to toggle delivery status"
                  >
                    {isDel ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">✓ Delivered</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="truncate">⏳ To Deliver</span>
                      </>
                    )}
                  </button>

                  {/* 1-Tap Amount Collected Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleCollected(customer.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isCol
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    }`}
                    title="Click to toggle collected status"
                  >
                    {isCol ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">✓ Collected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span className="truncate">⏳ Not Collected</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Row 4: Bill Action & Customer History Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                  {/* Separate Bill / Invoice button (User Requirement!) */}
                  <button
                    type="button"
                    onClick={() => onOpenCreateBill(customer)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Create / Send Bill Photo</span>
                  </button>

                  {/* View Full History */}
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(customer)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
