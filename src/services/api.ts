import { Product, Sale, SaleItem, StockMovement, StoreSettings } from '@/types';
import { INITIAL_SAMPLE_PRODUCTS } from '@/lib/seed';

const PRODUCTS_KEY = 'shemsu_products_v1';
const SALES_KEY = 'shemsu_sales_v1';
const MOVEMENTS_KEY = 'shemsu_movements_v1';
const SETTINGS_KEY = 'shemsu_settings_v1';

function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  const str = localStorage.getItem(key);
  if (!str) return defaultVal;
  try {
    return JSON.parse(str);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
}

function initDataIfEmpty() {
  const existingProds = getLocal<Product[]>(PRODUCTS_KEY, []);
  if (existingProds.length === 0) {
    const defaultProducts: Product[] = INITIAL_SAMPLE_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-${idx + 1}`,
      created_at: new Date(Date.now() - idx * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const initialMovements: StockMovement[] = defaultProducts.map((p) => ({
      id: `sm-init-${p.id}`,
      product_id: p.id,
      product_name: p.name,
      change_amount: p.stock_quantity,
      quantity_after: p.stock_quantity,
      reason: 'RESTOCK',
      note: 'Initial catalog setup',
      timestamp: p.created_at,
    }));

    setLocal(PRODUCTS_KEY, defaultProducts);
    setLocal(MOVEMENTS_KEY, initialMovements);
  }
}

export const api = {
  getProducts: async (): Promise<Product[]> => {
    initDataIfEmpty();
    return getLocal<Product[]>(PRODUCTS_KEY, []);
  },

  saveProduct: async (
    productData: Partial<Product> & { name: string; price: number; stock_quantity: number }
  ): Promise<Product> => {
    initDataIfEmpty();
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const movements = getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
    const now = new Date().toISOString();

    if (productData.id) {
      const idx = products.findIndex((p) => p.id === productData.id);
      if (idx !== -1) {
        const old = products[idx];
        const diff = productData.stock_quantity - old.stock_quantity;
        const updated: Product = { ...old, ...productData, updated_at: now };
        products[idx] = updated;

        if (diff !== 0) {
          movements.unshift({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product_id: updated.id,
            product_name: updated.name,
            change_amount: diff,
            quantity_after: updated.stock_quantity,
            reason: 'MANUAL_ADJUSTMENT',
            note: 'Product stock updated in catalog',
            timestamp: now,
          });
        }

        setLocal(PRODUCTS_KEY, products);
        setLocal(MOVEMENTS_KEY, movements);
        return updated;
      }
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name,
      category: productData.category || 'General',
      price: productData.price,
      cost_price: productData.cost_price,
      stock_quantity: productData.stock_quantity,
      low_stock_threshold: productData.low_stock_threshold ?? 5,
      image_url: productData.image_url || '📦',
      created_at: now,
      updated_at: now,
    };

    products.unshift(newProduct);
    movements.unshift({
      id: `sm-${Date.now()}`,
      product_id: newProduct.id,
      product_name: newProduct.name,
      change_amount: newProduct.stock_quantity,
      quantity_after: newProduct.stock_quantity,
      reason: 'RESTOCK',
      note: 'Initial catalog item creation',
      timestamp: now,
    });

    setLocal(PRODUCTS_KEY, products);
    setLocal(MOVEMENTS_KEY, movements);
    return newProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const filtered = products.filter((p) => p.id !== id);
    setLocal(PRODUCTS_KEY, filtered);
    return true;
  },

  restockProduct: async (id: string, addQuantity: number, note?: string): Promise<Product> => {
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const movements = getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
    const product = products.find((p) => p.id === id);

    if (!product) throw new Error('Product not found');

    const now = new Date().toISOString();
    product.stock_quantity += addQuantity;
    product.updated_at = now;

    movements.unshift({
      id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: product.id,
      product_name: product.name,
      change_amount: addQuantity,
      quantity_after: product.stock_quantity,
      reason: 'RESTOCK',
      note: note || `Restocked +${addQuantity} units`,
      timestamp: now,
    });

    setLocal(PRODUCTS_KEY, products);
    setLocal(MOVEMENTS_KEY, movements);
    return product;
  },

  getSales: async (): Promise<Sale[]> => {
    return getLocal<Sale[]>(SALES_KEY, []);
  },

  createSale: async (
    items: { product_id: string; quantity: number }[],
    paymentMethod: Sale['payment_method'] = 'CASH',
    notes?: string
  ): Promise<Sale> => {
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const sales = getLocal<Sale[]>(SALES_KEY, []);
    const movements = getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
    const now = new Date().toISOString();

    const saleId = `sale-${Date.now()}`;
    const saleNumber = `#INV-${Date.now().toString().slice(-6)}`;

    let totalAmount = 0;
    let totalItemsCount = 0;
    const saleItems: SaleItem[] = [];

    for (const itemReq of items) {
      const product = products.find((p) => p.id === itemReq.product_id);
      if (!product) continue;

      const lineTotal = product.price * itemReq.quantity;
      totalAmount += lineTotal;
      totalItemsCount += itemReq.quantity;

      // 1. Deduct stock immediately
      product.stock_quantity = Math.max(0, product.stock_quantity - itemReq.quantity);
      product.updated_at = now;

      // 2. Add SaleItem record
      const saleItem: SaleItem = {
        id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sale_id: saleId,
        product_id: product.id,
        product_name: product.name,
        quantity: itemReq.quantity,
        unit_price: product.price,
        line_total: lineTotal,
      };
      saleItems.push(saleItem);

      // 3. Log Stock Movement audit record
      movements.unshift({
        id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: product.id,
        product_name: product.name,
        change_amount: -itemReq.quantity,
        quantity_after: product.stock_quantity,
        reason: 'SALE',
        reference_id: saleId,
        note: `Sold via sale ${saleNumber}`,
        timestamp: now,
      });
    }

    const newSale: Sale = {
      id: saleId,
      sale_number: saleNumber,
      timestamp: now,
      total_amount: totalAmount,
      items_count: totalItemsCount,
      status: 'COMPLETED',
      payment_method: paymentMethod,
      notes,
      items: saleItems,
    };

    sales.unshift(newSale);
    setLocal(PRODUCTS_KEY, products);
    setLocal(SALES_KEY, sales);
    setLocal(MOVEMENTS_KEY, movements);

    return newSale;
  },

  voidSale: async (saleId: string, reason: string): Promise<Sale> => {
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const sales = getLocal<Sale[]>(SALES_KEY, []);
    const movements = getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
    const now = new Date().toISOString();

    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'VOIDED') throw new Error('Sale not found or already voided');

    sale.status = 'VOIDED';
    sale.void_reason = reason;
    sale.voided_at = now;

    if (sale.items) {
      for (const item of sale.items) {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          product.stock_quantity += item.quantity;
          product.updated_at = now;

          movements.unshift({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product_id: product.id,
            product_name: product.name,
            change_amount: item.quantity,
            quantity_after: product.stock_quantity,
            reason: 'VOID_SALE',
            reference_id: sale.id,
            note: `Voided sale ${sale.sale_number}: ${reason}`,
            timestamp: now,
          });
        }
      }
    }

    setLocal(PRODUCTS_KEY, products);
    setLocal(SALES_KEY, sales);
    setLocal(MOVEMENTS_KEY, movements);

    return sale;
  },

  getStockMovements: async (): Promise<StockMovement[]> => {
    return getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
  },

  getSettings: async (): Promise<StoreSettings> => {
    return getLocal<StoreSettings>(SETTINGS_KEY, {
      store_name: 'Corner Mini-Market & Kiosk',
      currency_symbol: '$',
      currency_code: 'USD',
      low_stock_alerts_enabled: true,
    });
  },

  updateSettings: async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
    const current = await api.getSettings();
    const updated = { ...current, ...settings };
    setLocal(SETTINGS_KEY, updated);
    return updated;
  },

  seedDemo: async (): Promise<Product[]> => {
    const defaultProducts: Product[] = INITIAL_SAMPLE_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-seed-${idx + 1}-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const initialMovements: StockMovement[] = defaultProducts.map((p) => ({
      id: `sm-seed-${p.id}`,
      product_id: p.id,
      product_name: p.name,
      change_amount: p.stock_quantity,
      quantity_after: p.stock_quantity,
      reason: 'RESTOCK',
      note: 'Demo Kiosk catalog seed',
      timestamp: p.created_at,
    }));

    setLocal(PRODUCTS_KEY, defaultProducts);
    setLocal(SALES_KEY, []);
    setLocal(MOVEMENTS_KEY, initialMovements);

    return defaultProducts;
  },
};
