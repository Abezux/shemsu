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
  Layers,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Agora Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
    business_type: 'GENERAL_RETAIL',
    expiry_alert_days: 30,
    custom_attributes: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterExpiringOnly, setFilterExpiringOnly] = useState(false);

  // Modals state
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

  const now = Date.now();
  const expiryCutoff = now + (settings.expiry_alert_days || 30) * 86400000;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.attributes?.batch_no ? String(p.attributes.batch_no).toLowerCase().includes(searchQuery.toLowerCase()) : false);

      const matchesLowStock = !filterLowStockOnly || p.stock_quantity <= p.low_stock_threshold;

      let matchesExpiring = true;
      if (filterExpiringOnly) {
        if (!p.attributes?.expiry_date) matchesExpiring = false;
        else {
          const exp = new Date(p.attributes.expiry_date as string).getTime();
          matchesExpiring = !isNaN(exp) && exp <= expiryCutoff;
        }
      }

      return matchesCat && matchesSearch && matchesLowStock && matchesExpiring;
    });
  }, [products, selectedCategory, searchQuery, filterLowStockOnly, filterExpiringOnly, expiryCutoff]);

  // Inventory KPI calculations
  const totalValuationCents = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
  }, [products]);

  const expiringCount = useMemo(() => {
    return products.filter((p) => {
      if (!p.attributes?.expiry_date) return false;
      const exp = new Date(p.attributes.expiry_date as string).getTime();
      return !isNaN(exp) && exp <= expiryCutoff;
    }).length;
  }, [products, expiryCutoff]);

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
    <div className="space-y-6 text-agora-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-agora-ink tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-agora-terracotta" />
            Inventory & Stock Catalog
          </h1>
          <p className="text-xs text-agora-ink-muted mt-0.5 font-medium">
            Manage product catalog, unit types, vertical attributes, and expiry date alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="ledger-card p-4">
          <div className="flex items-center justify-between text-agora-ink-muted text-xs font-bold">
            <span>Total Catalog Items</span>
            <Layers className="w-4 h-4 text-agora-terracotta" />
          </div>
          <div className="text-2xl font-serif font-black text-agora-ink mt-2">{products.length}</div>
          <span className="text-[10px] text-agora-ink-muted">Active product SKUs</span>
        </div>

        <div className="ledger-card p-4 border-agora-terracotta/40 bg-agora-terracotta-light/30">
          <div className="flex items-center justify-between text-agora-terracotta text-xs font-bold">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-agora-terracotta" />
          </div>
          <div className="text-2xl font-serif font-black text-agora-terracotta mt-2">{lowStockCount}</div>
          <span className="text-[10px] text-agora-terracotta font-semibold">Below threshold</span>
        </div>

        <div className="ledger-card p-4 border-agora-brick-border bg-agora-brick-light/30">
          <div className="flex items-center justify-between text-agora-brick text-xs font-bold">
            <span>Expiring Soon</span>
            <ShieldAlert className="w-4 h-4 text-agora-brick" />
          </div>
          <div className="text-2xl font-serif font-black text-agora-brick mt-2">{expiringCount}</div>
          <span className="text-[10px] text-agora-brick font-semibold">Within {settings.expiry_alert_days || 30} days</span>
        </div>

        <div className="ledger-card p-4">
          <div className="flex items-center justify-between text-agora-ink-muted text-xs font-bold">
            <span>Stock Valuation</span>
            <TrendingUp className="w-4 h-4 text-agora-sage" />
          </div>
          <div className="text-xl font-serif font-black text-agora-sage mt-2 truncate">
            {formatCurrency(totalValuationCents, settings.currency_symbol)}
          </div>
          <span className="text-[10px] text-agora-ink-muted">Total retail value</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="ledger-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-agora-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or batch number..."
              className="w-full bg-agora-bg border border-agora-border rounded-xl py-2 pl-9 pr-4 text-xs text-agora-ink focus:outline-none focus:border-agora-terracotta"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setFilterLowStockOnly(!filterLowStockOnly);
                setFilterExpiringOnly(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                filterLowStockOnly
                  ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta'
                  : 'bg-agora-card border-agora-border text-agora-ink-muted hover:text-agora-ink'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock ({lowStockCount})
            </button>

            <button
              onClick={() => {
                setFilterExpiringOnly(!filterExpiringOnly);
                setFilterLowStockOnly(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                filterExpiringOnly
                  ? 'bg-agora-brick-light border-agora-brick-border text-agora-brick'
                  : 'bg-agora-card border-agora-border text-agora-ink-muted hover:text-agora-ink'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-agora-brick" />
              Expiring Soon ({expiringCount})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-agora-terracotta text-agora-card'
                  : 'bg-agora-card border border-agora-border text-agora-ink-muted hover:text-agora-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table — Ledger Line Style */}
      <div className="ledger-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-agora-bg/80 border-b border-agora-border text-agora-ink-muted uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Attributes / Expiry</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agora-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-agora-ink-muted">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-agora-ink-muted">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.stock_quantity <= 0;
                  const isLow = !isOut && p.stock_quantity <= p.low_stock_threshold;
                  const expDate = p.attributes?.expiry_date ? new Date(p.attributes.expiry_date as string) : null;
                  const isExpiring = expDate ? expDate.getTime() <= expiryCutoff : false;

                  return (
                    <tr
                      key={p.id}
                      className="ledger-row"
                    >
                      <td className="p-4 font-bold text-agora-ink">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{p.image_url || '📦'}</span>
                          <div>
                            <span className="block font-bold text-sm text-agora-ink">{p.name}</span>
                            {p.cost_price && (
                              <span className="text-[10px] text-agora-ink-muted">
                                Cost: {formatCurrency(p.cost_price, settings.currency_symbol)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-agora-bg border border-agora-border text-agora-ink font-semibold text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4 font-serif font-bold text-agora-terracotta text-sm">
                        {formatCurrency(p.price, settings.currency_symbol)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="font-serif font-extrabold text-sm text-agora-ink">
                            {p.stock_quantity}
                          </span>
                          <span className="text-[10px] font-semibold text-agora-ink-muted uppercase">
                            {p.unit_type || 'pcs'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 space-y-1">
                        {expDate && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              isExpiring
                                ? 'bg-agora-brick-light border border-agora-brick-border text-agora-brick'
                                : 'bg-agora-bg border border-agora-border text-agora-ink-muted'
                            }`}
                          >
                            <Calendar className="w-3 h-3" /> Exp: {expDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                        )}

                        {p.attributes?.batch_no && (
                          <span className="text-[10px] text-agora-ink-muted block font-medium">
                            Batch: {String(p.attributes.batch_no)}
                          </span>
                        )}

                        {isLow && !isExpiring && (
                          <span className="px-2 py-0.5 rounded-full bg-agora-terracotta-light text-agora-terracotta border border-agora-terracotta-border text-[10px] font-bold inline-block">
                            Low Stock (≤{p.low_stock_threshold})
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenRestock(p)}
                          className="px-3 py-1.5 bg-agora-terracotta/10 hover:bg-agora-terracotta/20 text-agora-terracotta font-bold rounded-lg border border-agora-terracotta/30 transition-all text-xs inline-flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Restock
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-agora-ink-muted hover:text-agora-ink hover:bg-agora-bg rounded-lg transition-all"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-agora-brick/70 hover:text-agora-brick hover:bg-agora-brick-light rounded-lg transition-all"
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
