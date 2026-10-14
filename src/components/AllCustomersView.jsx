import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Tag, 
  Package, 
  CheckCircle2, 
  Clock, 
  Send, 
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sendWhatsAppBill } from '../utils/whatsapp';

export default function AllCustomersView({
  customers,
  products,
  business,
  onSelectCustomer,
  onAddCustomer,
  onViewBill
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const currency = business?.currency || "₹";

  const productsMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const prod = productsMap[c.productId];
      const matchSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.customerPlace && c.customerPlace.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (prod && prod.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      const balance = Math.max(0, (c.totalAmount || 0) - (c.collectedAmount || 0));

      if (filterType === 'DUE') return balance > 0;
      if (filterType === 'PENDING_DELIVERY') return c.deliveryStatus !== 'delivered' && c.deliveryStatus !== 'cancelled';
      if (filterType === 'DELIVERED') return c.deliveryStatus === 'delivered';
      if (filterType === 'PAID') return balance === 0 || c.paymentStatus === 'paid';

      return true;
    });
  }, [customers, productsMap, searchQuery, filterType]);

  const stats = useMemo(() => {
    const dueCount = customers.filter(c => (c.totalAmount - c.collectedAmount) > 0).length;
    const pendingDelCount = customers.filter(c => c.deliveryStatus !== 'delivered' && c.deliveryStatus !== 'cancelled').length;
    return { dueCount, pendingDelCount, total: customers.length };
  }, [customers]);

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>All Customers Directory</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                {customers.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct access to all customer accounts & rates across products
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, place, or product item..."
            className="w-full bg-[#121826]/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: `All (${customers.length})` },
            { id: 'DUE', label: `Balance Due (${stats.dueCount})` },
            { id: 'PENDING_DELIVERY', label: `Pending Delivery (${stats.pendingDelCount})` },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'PAID', label: 'Fully Paid' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                triggerHaptic('light');
                setFilterType(f.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
                filterType === f.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center space-y-3 mt-4 border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Customers Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter options.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(customer => {
            const product = productsMap[customer.productId];
            const balanceDue = Math.max(0, (customer.totalAmount || 0) - (customer.collectedAmount || 0));
            const isDelivered = customer.deliveryStatus === 'delivered';

            return (
              <div
                key={customer.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectCustomer(customer);
                }}
                className="group relative glass-card rounded-3xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-200 shadow-xl cursor-pointer space-y-3"
              >
                {/* Header: Avatar, Name, Place, Product Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-black text-sm flex-shrink-0 shadow-md">
                      {customer.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                        {customer.customerName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">{customer.customerPlace || "No place set"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Rate Pill */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                      Agreed Rate
                    </span>
                    <span className="text-sm font-extrabold text-emerald-300">
                      {currency}{(customer.customRate || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      /{product?.unit || 'unit'}
                    </span>
                  </div>
                </div>

                {/* Product Name tag */}
                {product && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-medium text-white truncate">{product.name}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{customer.quantity} {product.unit || 'units'}</span>
                  </div>
                )}

                {/* Financial bar & status */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDelivered ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {isDelivered ? 'Delivered' : 'Pending Delivery'}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      balanceDue === 0 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {balanceDue === 0 ? 'Fully Paid' : `Due: ${currency}${balanceDue.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Quick WhatsApp Action */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('success');
                        sendWhatsAppBill({ customer, product, business });
                      }}
                      className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 active:scale-95"
                      title="Send WhatsApp Bill"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="text-[11px]">WhatsApp</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
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
