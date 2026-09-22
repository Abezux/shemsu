import fs from 'fs';
import path from 'path';
import { Product, Sale, SaleItem, StockMovement, StoreSettings } from '@/types';
import { INITIAL_SAMPLE_PRODUCTS } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'shemsu_store.json');

interface StoreData {
  products: Product[];
  sales: Sale[];
  stock_movements: StockMovement[];
  settings: StoreSettings;
}

function ensureDataFile(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultProducts: Product[] = INITIAL_SAMPLE_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-${idx + 1}`,
      created_at: new Date(Date.now() - idx * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const initialData: StoreData = {
      products: defaultProducts,
      sales: [],
      stock_movements: defaultProducts.map((p) => ({
        id: `sm-init-${p.id}`,
        product_id: p.id,
        product_name: p.name,
        change_amount: p.stock_quantity,
        quantity_after: p.stock_quantity,
        reason: 'RESTOCK',
        note: 'Initial inventory setup',
        timestamp: p.created_at,
      })),
      settings: {
        store_name: 'Corner Mini-Market & Kiosk',
        currency_symbol: '$',
        currency_code: 'USD',
        low_stock_alerts_enabled: true,
      },
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON DB file, resetting:', err);
    return {
      products: [],
      sales: [],
      stock_movements: [],
      settings: {
        store_name: 'Corner Kiosk',
        currency_symbol: '$',
        currency_code: 'USD',
        low_stock_alerts_enabled: true,
      },
    };
  }
}

function saveStoreData(data: StoreData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Data access operations
export const db = {
  getProducts: (): Product[] => {
    return ensureDataFile().products;
  },

  getProductById: (id: string): Product | undefined => {
    return ensureDataFile().products.find((p) => p.id === id);
  },

  saveProduct: (productData: Partial<Product> & { name: string; price: number; stock_quantity: number }): Product => {
    const data = ensureDataFile();
    const now = new Date().toISOString();
    
    if (productData.id) {
      // Update existing
      const index = data.products.findIndex((p) => p.id === productData.id);
      if (index !== -1) {
        const oldProduct = data.products[index];
        const stockDiff = productData.stock_quantity - oldProduct.stock_quantity;
        
        const updatedProduct: Product = {
          ...oldProduct,
          ...productData,
          updated_at: now,
        };
        data.products[index] = updatedProduct;

        // Log manual stock adjustment if changed directly
        if (stockDiff !== 0) {
          data.stock_movements.unshift({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product_id: updatedProduct.id,
            product_name: updatedProduct.name,
            change_amount: stockDiff,
            quantity_after: updatedProduct.stock_quantity,
            reason: 'MANUAL_ADJUSTMENT',
            note: 'Product stock updated in catalog',
            timestamp: now,
          });
        }

        saveStoreData(data);
        return updatedProduct;
      }
    }

    // Create new
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

    data.products.unshift(newProduct);
    data.stock_movements.unshift({
      id: `sm-${Date.now()}`,
      product_id: newProduct.id,
      product_name: newProduct.name,
      change_amount: newProduct.stock_quantity,
      quantity_after: newProduct.stock_quantity,
      reason: 'RESTOCK',
      note: 'Initial catalog item creation',
      timestamp: now,
    });

    saveStoreData(data);
    return newProduct;
  },

  deleteProduct: (id: string): boolean => {
    const data = ensureDataFile();
    const index = data.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      data.products.splice(index, 1);
      saveStoreData(data);
      return true;
    }
    return false;
  },

  restockProduct: (id: string, addQuantity: number, note?: string): Product | undefined => {
    const data = ensureDataFile();
    const product = data.products.find((p) => p.id === id);
    if (!product) return undefined;

    const now = new Date().toISOString();
    product.stock_quantity += addQuantity;
    product.updated_at = now;

    data.stock_movements.unshift({
      id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: product.id,
      product_name: product.name,
      change_amount: addQuantity,
      quantity_after: product.stock_quantity,
      reason: 'RESTOCK',
      note: note || `Restocked +${addQuantity} units`,
      timestamp: now,
    });

    saveStoreData(data);
    return product;
  },

  getSales: (): Sale[] => {
    return ensureDataFile().sales;
  },

  createSale: (
    items: { product_id: string; quantity: number }[],
    paymentMethod: Sale['payment_method'] = 'CASH',
    notes?: string
  ): Sale => {
    const data = ensureDataFile();
    const now = new Date().toISOString();
    const saleId = `sale-${Date.now()}`;
    const saleNumber = `#INV-${Date.now().toString().slice(-6)}`;

    let totalAmount = 0;
    let totalItemsCount = 0;
    const saleItems: SaleItem[] = [];

    for (const itemReq of items) {
      const product = data.products.find((p) => p.id === itemReq.product_id);
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
      data.stock_movements.unshift({
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

    data.sales.unshift(newSale);
    saveStoreData(data);
    return newSale;
  },

  voidSale: (saleId: string, voidReason: string): Sale | undefined => {
    const data = ensureDataFile();
    const sale = data.sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'VOIDED') return undefined;

    const now = new Date().toISOString();
    sale.status = 'VOIDED';
    sale.void_reason = voidReason;
    sale.voided_at = now;

    // Restore stock for every item in the voided sale
    if (sale.items) {
      for (const item of sale.items) {
        const product = data.products.find((p) => p.id === item.product_id);
        if (product) {
          product.stock_quantity += item.quantity;
          product.updated_at = now;

          data.stock_movements.unshift({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product_id: product.id,
            product_name: product.name,
            change_amount: item.quantity,
            quantity_after: product.stock_quantity,
            reason: 'VOID_SALE',
            reference_id: sale.id,
            note: `Voided sale ${sale.sale_number}: ${voidReason}`,
            timestamp: now,
          });
        }
      }
    }

    saveStoreData(data);
    return sale;
  },

  getStockMovements: (): StockMovement[] => {
    return ensureDataFile().stock_movements;
  },

  getSettings: (): StoreSettings => {
    return ensureDataFile().settings;
  },

  updateSettings: (newSettings: Partial<StoreSettings>): StoreSettings => {
    const data = ensureDataFile();
    data.settings = { ...data.settings, ...newSettings };
    saveStoreData(data);
    return data.settings;
  },

  seedDemoCatalog: (): Product[] => {
    const data = ensureDataFile();
    const defaultProducts: Product[] = INITIAL_SAMPLE_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-seed-${idx + 1}-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    data.products = defaultProducts;
    data.sales = [];
    data.stock_movements = defaultProducts.map((p) => ({
      id: `sm-seed-${p.id}`,
      product_id: p.id,
      product_name: p.name,
      change_amount: p.stock_quantity,
      quantity_after: p.stock_quantity,
      reason: 'RESTOCK',
      note: 'Demo Kiosk catalog seed',
      timestamp: p.created_at,
    }));

    saveStoreData(data);
    return data.products;
  },
};
