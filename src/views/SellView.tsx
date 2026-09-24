import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Sale, StoreSettings } from '@/types';
import { api } from '@/services/api';
import ProductTile from '@/components/pos/ProductTile';
import CartDrawer from '@/components/pos/CartDrawer';
import CheckoutModal from '@/components/pos/CheckoutModal';
import { Search, AlertTriangle, Sparkles, ShoppingCart, RefreshCw } from 'lucide-react';

export default function SellView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Corner Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
    business_type: 'GENERAL_RETAIL',
    expiry_alert_days: 30,
    custom_attributes: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, stgs] = await Promise.all([api.getProducts(), api.getSettings()]);
      setProducts(prods);
      setSettings(stgs);
    } catch (err) {
      console.error('Error loading register data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 4000);
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
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'ALL' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLowStock =
        !showLowStockOnly || product.stock_quantity <= product.low_stock_threshold;

      return matchesCategory && matchesSearch && matchesLowStock;
    });
  }, [products, selectedCategory, searchQuery, showLowStockOnly]);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          showWarning(`Cannot add more than available stock (${product.stock_quantity} ${product.unit_type || 'units'})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock_quantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleConfirmSale = async (
    paymentMethod: Sale['payment_method'],
    notes?: string
  ): Promise<Sale | undefined> => {
    const saleItems = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const sale = await api.createSale(saleItems, paymentMethod, notes);
    setCart([]);
    await loadData();
    return sale;
  };

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length,
    [products]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {warningMessage && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{warningMessage}</span>
            </div>
            <button onClick={() => setWarningMessage(null)} className="text-amber-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
              <button
                type="button"
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  showLowStockOnly
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Stock ({lowStockCount})</span>
              </button>

              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Refresh catalog"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[350px]">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 bg-slate-900 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-200 text-base">No matching products</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {products.length === 0
                  ? 'Your shop catalog is currently empty. Click "Load Kiosk Demo Catalog" in the top bar to seed demo items.'
                  : 'Try clearing your search query or selecting a different category.'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={async () => {
                    await api.seedDemo();
                    loadData();
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
                >
                  <Sparkles className="w-4 h-4" /> Load Sample Kiosk Catalog
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((i) => i.product.id === product.id);
                return (
                  <ProductTile
                    key={product.id}
                    product={product}
                    currencySymbol={settings.currency_symbol}
                    cartQuantity={cartItem?.quantity || 0}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-auto">
        <CartDrawer
          cart={cart}
          currencySymbol={settings.currency_symbol}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currencySymbol={settings.currency_symbol}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  );
}
