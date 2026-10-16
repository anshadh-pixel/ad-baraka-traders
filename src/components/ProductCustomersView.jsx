import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Receipt, 
  Check, 
  Package, 
  FileText,
  Truck
} from 'lucide-react';
import { getCustomerStats } from '../utils/storage';

export default function ProductCustomersView({
  product,
  customers,
  currency = "₹",
  onBack,
  onSelectCustomer,
  onAddCustomer,
  onDeliverOrder,
  onOpenCreateBill
}) {
  const [search, setSearch] = useState('');
  // Primary Tabs: 'customers' (2-line delivered list) or 'pending_orders' (orders to deliver) or 'all'
  const [activeTab, setActiveTab] = useState('customers');

  // Customers for this specific product
  const productCustomers = customers.filter(c => c.productId === product.id);

  // Delivered vs Pending Orders
  const deliveredCustomers = productCustomers.filter(c => c.isDelivered);
  const pendingOrders = productCustomers.filter(c => !c.isDelivered);

  // Route Totals
  const totalCustomersCount = productCustomers.length;
  const pendingOrdersCount = pendingOrders.length;
  
  // 1. Pending Bill Amount (amount yet to be collected)
  const billAmountPending = productCustomers.reduce((sum, c) => {
    if (!c.isCollected) {
      const qty = Number(c.quantity) || 36;
      const rate = Number(c.customRate || c.price) || 0;
      return sum + (Number(c.totalAmount) || (qty * rate));
    }
    return sum;
  }, 0);

  // 2. Total Collected Amount
  const totalCollectedAmount = productCustomers.reduce((sum, c) => {
    if (c.isCollected) {
      const qty = Number(c.quantity) || 36;
      const rate = Number(c.customRate || c.price) || 0;
      return sum + (Number(c.totalAmount) || (qty * rate));
    }
    return sum;
  }, 0);

  // 3. Total Route Sales Value
  const totalSalesValue = billAmountPending + totalCollectedAmount;

  // Determine which list to display based on activeTab
  let displayList = deliveredCustomers;
  if (activeTab === 'pending_orders') {
    displayList = pendingOrders;
  } else if (activeTab === 'all') {
    displayList = productCustomers;
  }

  // Filter with Search
  const filteredList = displayList.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = c.customerName.toLowerCase().includes(q);
    const placeMatch = c.customerPlace && c.customerPlace.toLowerCase().includes(q);
    const phoneMatch = c.customerPhone && c.customerPhone.includes(q);
    return nameMatch || placeMatch || phoneMatch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Navigation */}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              title="Create a new bill or invoice"
            >
              <Receipt className="w-4 h-4" />
              <span>+ Create Bill</span>
            </button>

            {/* Add Customer Button */}
            <button
              onClick={() => onAddCustomer(product)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Product Details Banner with the 3 Required Metrics */}
        <div className="biz-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Product Details & Summary
              </span>
              <h2 className="text-base font-extrabold text-white">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Route Value
              </span>
              <span className="text-base font-black text-white">
                {currency}{totalSalesValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* The 3 Core Metrics: Pending Order, Bill Amount Pending, Total Collected Amount */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
            {/* 1. Pending Orders */}
            <div 
              onClick={() => setActiveTab('pending_orders')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                activeTab === 'pending_orders'
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-xs'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-semibold">
                Pending Orders
              </span>
              <span className={`text-sm font-extrabold mt-0.5 block flex items-center justify-center gap-1 ${
                pendingOrdersCount > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                <Clock className="w-3.5 h-3.5 inline" />
                <span>{pendingOrdersCount} {pendingOrdersCount === 1 ? 'Order' : 'Orders'}</span>
              </span>
            </div>

            {/* 2. Bill Amount Pending */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Bill Amt Pending
              </span>
              <span className={`text-sm font-extrabold mt-0.5 block ${
                billAmountPending > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {billAmountPending > 0 ? `${currency}${billAmountPending.toLocaleString()}` : '₹0'}
              </span>
            </div>

            {/* 3. Total Collected Amount */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Total Collected
              </span>
              <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                {currency}{totalCollectedAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Tabs: Customers vs Pending Orders */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Customers (കസ്റ്റമേഴ്സ്)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {deliveredCustomers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending_orders')}
            className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pending_orders'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Orders (പെൻഡിംഗ്)</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-900 font-extrabold">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar with Fixed Padding & Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'pending_orders'
                ? "Search pending orders..."
                : "Search customer by name or place..."
            }
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CUSTOMERS (2-LINE COMPACT LIST - NO ENDLESS SCROLLING) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="space-y-2">
          {filteredList.length === 0 ? (
            <div className="biz-card p-8 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-sm">No Delivered Customers Yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {pendingOrdersCount > 0 
                    ? `You have ${pendingOrdersCount} pending orders! Switch to 'Pending Orders' tab and tap 'Deliver' to add them here.`
                    : "Click '+ Add Customer' to add customer records."}
                </p>
              </div>
              {pendingOrdersCount > 0 && (
                <button
                  onClick={() => setActiveTab('pending_orders')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  View {pendingOrdersCount} Pending Orders →
                </button>
              )}
            </div>
          ) : (
            filteredList.map(customer => {
              const qty = Number(customer.quantity) || 36;
              const rate = Number(customer.customRate || customer.price) || 0;
              const amt = Number(customer.totalAmount) || (qty * rate);

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="p-3 rounded-xl biz-card biz-card-hover cursor-pointer border border-slate-800/90 transition-all active:scale-[0.99] flex items-center justify-between gap-3 shadow-xs"
                >
                  {/* Left: Line 1 (Name & Place) and Line 2 (Delivered & Paid status) */}
                  <div className="min-w-0 flex-1">
                    {/* LINE 1: Name and Place */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-extrabold text-sm text-white capitalize truncate group-hover:text-blue-400 transition-colors">
                        {customer.customerName}
                      </h4>
                      {customer.customerPlace && (
                        <span className="text-xs text-slate-400 capitalize truncate flex items-center gap-0.5 flex-shrink-0">
                          <span className="text-slate-600">•</span>
                          <MapPin className="w-3 h-3 text-blue-400 inline" />
                          <span>{customer.customerPlace}</span>
                        </span>
                      )}
                    </div>

                    {/* LINE 2: Delivered badge & Amount pending/collected badge */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </span>

                      <span className="text-slate-600 text-xs">•</span>

                      {customer.isCollected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <span>Paid ({currency}{amt})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30">
                          <span>Due: {currency}{amt}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Price calculation & Chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white block">
                        {currency}{amt.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {qty} × {currency}{rate}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PENDING ORDERS (ORDERS WAITING FOR DELIVERY)           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pending_orders' && (
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="biz-card p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-sm">All Orders Delivered! 🎉</h3>
                <p className="text-xs text-slate-400 mt-1">
                  There are no pending deliveries right now. All customers have received their supply.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('customers')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                View Customers List
              </button>
            </div>
          ) : (
            filteredList.map(customer => {
              const qty = Number(customer.quantity) || 36;
              const rate = Number(customer.customRate || customer.price) || 0;
              const amt = Number(customer.totalAmount) || (qty * rate);

              return (
                <div
                  key={customer.id}
                  className="biz-card p-4 space-y-3 border border-amber-500/30 bg-[#162032] shadow-sm"
                >
                  {/* Top Line: Name, Place & Amt */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          ⏳ To Deliver
                        </span>
                        <h4 className="font-extrabold text-base text-white capitalize">
                          {customer.customerName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        {customer.customerPlace && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span className="capitalize">{customer.customerPlace}</span>
                          </span>
                        )}
                        {customer.customerPhone && (
                          <span>• 📞 {customer.customerPhone}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-white block">
                        {currency}{amt.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {qty} units × {currency}{rate}
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Button: [ Deliver Order & Move to Customers ] */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                    {/* Mark Delivered Button (Moves to Customers list & removes from here!) */}
                    <button
                      type="button"
                      onClick={() => onDeliverOrder(customer.id)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Deliver (ഡെലിവേർഡ്)</span>
                    </button>

                    {/* View Details / Bill */}
                    <button
                      type="button"
                      onClick={() => onSelectCustomer(customer)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Details & Bill</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
