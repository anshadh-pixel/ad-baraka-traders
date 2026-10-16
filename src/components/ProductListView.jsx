import React, { useState } from 'react';
import { Plus, Search, X, ChevronRight, Package, Users, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { getCustomerStats } from '../utils/storage';

export default function ProductListView({
  products,
  customers,
  currency = "₹",
  onSelectProduct,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Products</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {products.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a product to view and manage route customers
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar with Fixed Padding & Dedicated Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
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

      {/* Product Cards List */}
      {filtered.length === 0 ? (
        <div className="biz-card p-8 text-center space-y-3 mt-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Products Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search ? `No products match "${search}"` : "Click 'Add Product' above to create your first product!"}
            </p>
          </div>
          <button
            onClick={onAddProduct}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            + Add New Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => {
            const productCustomers = customers.filter(c => c.productId === product.id);
            
            // Calculate total pending dues for this product across all its customers
            const totalPendingDue = productCustomers.reduce((sum, c) => {
              const stats = getCustomerStats(c);
              return sum + stats.totalBalanceDue;
            }, 0);

            const pendingDeliveries = productCustomers.filter(c => !c.isDelivered).length;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="biz-card biz-card-hover p-4 cursor-pointer relative group transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white truncate group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>Base Rate:</span>
                      <span className="font-bold text-slate-200">
                        {currency}{Number(product.basePrice).toLocaleString()} / {product.unit || 'unit'}
                      </span>
                    </div>
                  </div>

                  {/* Edit / Delete product icons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditProduct(product)}
                      title="Edit Product"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      title="Delete Product"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom stats & action */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{productCustomers.length} {productCustomers.length === 1 ? 'Customer' : 'Customers'}</span>
                    </span>

                    {totalPendingDue > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-amber-400 font-bold bg-amber-500/10 border border-amber-500/25 whitespace-nowrap">
                        Due: {currency}{totalPendingDue.toLocaleString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                        All Paid
                      </span>
                    )}

                    {pendingDeliveries > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30 whitespace-nowrap">
                        {pendingDeliveries} to deliver
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-0.5">
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 font-bold text-xs group-hover:bg-blue-600/25 transition-all">
                      <span>View Route Customers</span>
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
