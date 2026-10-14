import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  Users, 
  Package,
  ArrowUpRight
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sendWhatsAppBill } from '../utils/whatsapp';

export default function AnalyticsView({
  customers,
  products,
  business,
  onSelectCustomer
}) {
  const currency = business?.currency || "₹";

  const productsMap = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p.id] = p; });
    return map;
  }, [products]);

  // Overall financial calculations
  const stats = useMemo(() => {
    const totalSales = customers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    const totalCollected = customers.reduce((sum, c) => sum + (Number(c.collectedAmount) || 0), 0);
    const totalDue = Math.max(0, totalSales - totalCollected);
    const collectionRate = totalSales > 0 ? Math.round((totalCollected / totalSales) * 100) : 100;

    const deliveredCount = customers.filter(c => c.deliveryStatus === 'delivered').length;
    const pendingDelCount = customers.filter(c => c.deliveryStatus !== 'delivered' && c.deliveryStatus !== 'cancelled').length;

    // Customers with due
    const customersWithDue = customers
      .filter(c => (Number(c.totalAmount) || 0) - (Number(c.collectedAmount) || 0) > 0)
      .map(c => ({
        ...c,
        due: (Number(c.totalAmount) || 0) - (Number(c.collectedAmount) || 0)
      }))
      .sort((a, b) => b.due - a.due);

    // Breakdown per product
    const productBreakdown = products.map(p => {
      const pCustomers = customers.filter(c => c.productId === p.id);
      const revenue = pCustomers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
      const units = pCustomers.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
      return {
        ...p,
        revenue,
        units,
        customerCount: pCustomers.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalSales,
      totalCollected,
      totalDue,
      collectionRate,
      deliveredCount,
      pendingDelCount,
      customersWithDue,
      productBreakdown
    };
  }, [customers, products]);

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Business Analytics</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {stats.collectionRate}% Collected
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time cash flow, pending dues & fulfillment tracking
        </p>
      </div>

      {/* Main 2x2 Financial Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Sales */}
        <div className="glass-card rounded-3xl p-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Sales</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-white tracking-tight">
              {currency}{stats.totalSales.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Across {customers.length} orders
            </span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="glass-card rounded-3xl p-4 border border-emerald-500/25 bg-emerald-500/[0.04] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Collected</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-emerald-300 tracking-tight">
              {currency}{stats.totalCollected.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">
              {stats.collectionRate}% recovery
            </span>
          </div>
        </div>

        {/* Balance Due */}
        <div className="glass-card rounded-3xl p-4 border border-amber-500/25 bg-amber-500/[0.04] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Pending Balance</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-amber-300 tracking-tight">
              {currency}{stats.totalDue.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">
              {stats.customersWithDue.length} customers with dues
            </span>
          </div>
        </div>

        {/* Deliveries */}
        <div className="glass-card rounded-3xl p-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fulfillment</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-white tracking-tight">
              {stats.deliveredCount} / {customers.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {stats.pendingDelCount} orders in transit
            </span>
          </div>
        </div>
      </div>

      {/* Outstanding Dues & Direct WhatsApp Collection */}
      <div className="glass-card rounded-3xl p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Pending Due Collections</h3>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {currency}{stats.totalDue.toLocaleString()} Total
          </span>
        </div>

        {stats.customersWithDue.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 font-semibold">
            🎉 Amazing! All customer payments are 100% collected!
          </div>
        ) : (
          <div className="space-y-2">
            {stats.customersWithDue.slice(0, 5).map(c => {
              const prod = productsMap[c.productId];
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectCustomer(c);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{c.customerName}</h4>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {c.customerPlace} • {prod?.name || 'Product'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block">
                        {currency}{c.due.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase block">Due</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('success');
                        sendWhatsAppBill({ customer: c, product: prod, business });
                      }}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 active:scale-90 transition-all"
                      title="Send WhatsApp Due Reminder"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sales by Product Breakdown */}
      <div className="glass-card rounded-3xl p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Revenue by Product</h3>
          </div>
          <span className="text-xs text-slate-400">{products.length} Products</span>
        </div>

        <div className="space-y-2.5">
          {stats.productBreakdown.map(p => {
            const pct = stats.totalSales > 0 ? Math.round((p.revenue / stats.totalSales) * 100) : 0;
            return (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[180px]">{p.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-300">{currency}{p.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({pct}%)</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
