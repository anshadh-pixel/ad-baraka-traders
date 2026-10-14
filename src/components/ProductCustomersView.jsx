import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag,
  Edit,
  Trash2
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
  onDeleteCustomer
}) {
  const [search, setSearch] = useState('');

  // Only customers who buy this specific product
  const productCustomers = customers.filter(c => c.productId === product.id);

  const filtered = productCustomers.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (c.customerPlace && c.customerPlace.toLowerCase().includes(search.toLowerCase())) ||
    (c.customerPhone && c.customerPhone.includes(search))
  );

  return (
    <div className="space-y-4 pb-16">
      {/* Top Navigation & Header */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>

          <button
            onClick={() => onAddCustomer(product)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Product Info Banner */}
        <div className="biz-card p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Product Customers
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
            <span>Standard Price:</span>
            <span className="font-semibold text-slate-200">
              {currency}{Number(product.basePrice).toLocaleString()} / {product.unit || 'unit'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{productCustomers.length} Customers assigned</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or place..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            name="search_customers_query"
            className="biz-input pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              Clear
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
            <h3 className="font-bold text-white text-base">No Customers for this Product</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search 
                ? `No customers match "${search}".` 
                : `You haven't added any customers for ${product.name} yet. Click 'Add Customer' to set custom price and enter bills!`}
            </p>
          </div>
          <button
            onClick={() => onAddCustomer(product)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            + Add First Customer for {product.name}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(customer => {
            const stats = getCustomerStats(customer);
            const rateDiff = (Number(customer.customRate) || 0) - (Number(product.basePrice) || 0);

            return (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className="biz-card biz-card-hover p-4 cursor-pointer relative group transition-all"
              >
                {/* Header: Name, Location, Agreed Rate */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-white truncate group-hover:text-blue-400 transition-colors">
                      {customer.customerName}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      {customer.customerPlace && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.customerPlace}</span>
                        </span>
                      )}
                      {customer.customerPhone && (
                        <span className="text-slate-400">
                          📞 {customer.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer's Negotiated Special Rate */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Agreed Rate
                    </span>
                    <span className="text-sm font-extrabold text-blue-400">
                      {currency}{(Number(customer.customRate) || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      /{product.unit || 'unit'}
                    </span>
                  </div>
                </div>

                {/* Status bar: Pending Balance & Delivery status */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Pending Balance Badge */}
                    {stats.totalBalanceDue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Pending Due: {currency}{stats.totalBalanceDue.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>No Dues (Paid)</span>
                      </span>
                    )}

                    {/* Delivery Status Badge */}
                    {stats.pendingDeliveries > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>Delivery Pending</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] px-1 whitespace-nowrap">
                        Delivered
                      </span>
                    )}

                    <span className="text-slate-500 text-[11px] whitespace-nowrap">
                      • {stats.billCount} {stats.billCount === 1 ? 'Bill' : 'Bills'}
                    </span>
                  </div>

                  {/* Clean Action Row */}
                  <div className="flex items-center justify-end pt-0.5">
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 font-bold text-xs group-hover:bg-blue-600/25 transition-all">
                      <span>Bills & Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
