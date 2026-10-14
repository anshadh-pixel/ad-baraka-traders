import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Users, 
  Clock, 
  ChevronRight, 
  Tag, 
  MoreVertical, 
  Edit3, 
  Trash2,
  DollarSign,
  Layers
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const COLOR_MAP = {
  emerald: {
    bg: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  },
  amber: {
    bg: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20'
  },
  violet: {
    bg: 'from-purple-500/20 to-indigo-500/10',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20'
  },
  rose: {
    bg: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/20',
    iconText: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20'
  },
  cyan: {
    bg: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/30',
    iconBg: 'bg-cyan-500/20',
    iconText: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
  }
};

export default function ProductList({ 
  products, 
  customers, 
  business, 
  onSelectProduct, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Compute metrics per product
  const productStats = useMemo(() => {
    const stats = {};
    products.forEach(p => {
      const pCustomers = customers.filter(c => c.productId === p.id);
      const pendingDeliveries = pCustomers.filter(c => c.deliveryStatus !== 'delivered' && c.deliveryStatus !== 'cancelled').length;
      const rates = pCustomers.map(c => Number(c.customRate) || 0).filter(r => r > 0);
      const minRate = rates.length > 0 ? Math.min(...rates) : p.basePrice;
      const maxRate = rates.length > 0 ? Math.max(...rates) : p.basePrice;
      const totalUnits = pCustomers.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
      const totalRevenue = pCustomers.reduce((acc, c) => acc + (Number(c.totalAmount) || 0), 0);

      stats[p.id] = {
        customerCount: pCustomers.length,
        pendingDeliveries,
        minRate,
        maxRate,
        hasRateVariation: minRate !== maxRate,
        totalUnits,
        totalRevenue
      };
    });
    return stats;
  }, [products, customers]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Search & Header Section */}
      <div className="space-y-3">
        {/* Title & Quick Add Banner */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Products & Rates</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                {products.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tap any product to view & manage customer specific rates
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onAddProduct();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or categories..."
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

        {/* Category Filter Pills (Horizontal Scroll) */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat === 'ALL' ? 'All Products' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid / Cards */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center space-y-3 mt-4 border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Products Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery 
                ? `No products match "${searchQuery}". Try a different keyword.` 
                : "Add your first product to start assigning custom rates per customer!"}
            </p>
          </div>
          <button
            onClick={onAddProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const stats = productStats[product.id] || { customerCount: 0, pendingDeliveries: 0 };
            const theme = COLOR_MAP[product.color] || COLOR_MAP.emerald;

            return (
              <div
                key={product.id}
                className="group relative glass-card rounded-3xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-200 shadow-xl overflow-hidden"
              >
                {/* Subtle gradient accent in top right */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${theme.bg} blur-2xl pointer-events-none opacity-40`} />

                {/* Card Main Interactive Content */}
                <div 
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectProduct(product);
                  }}
                  className="cursor-pointer space-y-3"
                >
                  {/* Top Bar: Icon + Title + Category + Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} border ${theme.border} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Package className={`w-6 h-6 ${theme.iconText}`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {product.category && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                              {product.category}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            Unit: <span className="text-slate-200 font-medium">{product.unit || 'Unit'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Three-dots menu trigger */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('light');
                          setMenuOpenId(menuOpenId === product.id ? null : product.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpenId === product.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 z-20 w-36 glass-panel bg-[#161f30] border border-white/10 rounded-2xl p-1 shadow-2xl animate-scale-in"
                        >
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              onEditProduct(product);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-xl transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit Product</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              onDeleteProduct(product);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Customer Rate Insights */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    {/* Base Rate */}
                    <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                        Base Price
                      </span>
                      <div className="text-sm font-extrabold text-white mt-0.5">
                        {business?.currency || "₹"}{Number(product.basePrice || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{product.unit || 'unit'}</span>
                      </div>
                    </div>

                    {/* Customer Specific Rate Range */}
                    <div className="p-2.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider block">
                        Customer Rates
                      </span>
                      <div className="text-sm font-extrabold text-emerald-300 mt-0.5">
                        {stats.customerCount > 0 ? (
                          stats.hasRateVariation ? (
                            <span>{business?.currency || "₹"}{stats.minRate.toLocaleString()} - {business?.currency || "₹"}{stats.maxRate.toLocaleString()}</span>
                          ) : (
                            <span>{business?.currency || "₹"}{stats.minRate.toLocaleString()}</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">No customers yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar: Customers count, Pending status & Click prompt */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs">
                      {/* Customer Count */}
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{stats.customerCount} {stats.customerCount === 1 ? 'Customer' : 'Customers'}</span>
                      </span>

                      {/* Pending Delivery Badge */}
                      {stats.pendingDeliveries > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 text-[11px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>{stats.pendingDeliveries} to deliver</span>
                        </span>
                      )}
                    </div>

                    {/* Action Prompt */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>View Customers</span>
                      <ChevronRight className="w-4 h-4" />
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
