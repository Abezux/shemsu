import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreSettings } from '@/types';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/currency';
import AddEditProductModal from '@/components/inventory/AddEditProductModal';
import RestockModal from '@/components/inventory/RestockModal';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  PackageX,
  Layers
} from 'lucide-react';

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Corner Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [productToRestock, setProductToRestock] = useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, stgs] = await Promise.all([api.getProducts(), api.getSettings()]);
      setProducts(prods);
      setSettings(stgs);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLowStock = !filterLowStockOnly || p.stock_quantity <= p.low_stock_threshold;

      return matchesCat && matchesSearch && matchesLowStock;
    });
  }, [products, selectedCategory, searchQuery, filterLowStockOnly]);

  const totalValuationCents = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity <= 0).length;
  }, [products]);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsAddEditOpen(true);
  };

  const handleOpenRestock = (p: Product) => {
    setProductToRestock(p);
    setIsRestockOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    await api.saveProduct(productData);
    await loadData();
  };

  const handleRestockProduct = async (productId: string, addQty: number, note?: string) => {
    await api.restockProduct(productId, addQty, note);
    await loadData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from catalog?`)) {
      await api.deleteProduct(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-400" />
            Inventory & Stock Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your shop products, low-stock alerts, and perform instant inventory restocking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Catalog Items</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">{products.length}</div>
          <span className="text-[10px] text-slate-500">Active product SKUs</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{lowStockCount}</div>
          <span className="text-[10px] text-amber-500">Below reorder threshold</span>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>Out of Stock</span>
            <PackageX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{outOfStockCount}</div>
          <span className="text-[10px] text-rose-500">Needs immediate restock</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Stock Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2 truncate">
            {formatCurrency(totalValuationCents, settings.currency_symbol)}
          </div>
          <span className="text-[10px] text-slate-500">Total retail value of stock</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog by name or category..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              filterLowStockOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Alerts Only
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Alert Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.stock_quantity <= 0;
                  const isLow = !isOut && p.stock_quantity <= p.low_stock_threshold;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-all ${
                        isOut
                          ? 'bg-rose-950/10'
                          : isLow
                          ? 'bg-amber-950/10'
                          : ''
                      }`}
                    >
                      <td className="p-4 font-semibold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{p.image_url || '📦'}</span>
                          <div>
                            <span className="block font-bold text-sm text-white">{p.name}</span>
                            {p.cost_price && (
                              <span className="text-[10px] text-slate-500">
                                Cost: {formatCurrency(p.cost_price, settings.currency_symbol)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(p.price, settings.currency_symbol)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-white">
                            {p.stock_quantity}
                          </span>
                          <span className="text-[10px] text-slate-400">units</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center gap-1 w-max">
                            <PackageX className="w-3 h-3 text-rose-400" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-amber-400" /> Low (≤{p.low_stock_threshold})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium w-max block">
                            Healthy (Threshold {p.low_stock_threshold})
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenRestock(p)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 transition-all text-xs inline-flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Restock
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditProductModal
        isOpen={isAddEditOpen}
        productToEdit={productToEdit}
        currencySymbol={settings.currency_symbol}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveProduct}
      />

      <RestockModal
        isOpen={isRestockOpen}
        product={productToRestock}
        onClose={() => setIsRestockOpen(false)}
        onRestock={handleRestockProduct}
      />
    </div>
  );
}
