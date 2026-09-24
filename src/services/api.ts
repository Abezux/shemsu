import { 
  Product, 
  Sale, 
  SaleItem, 
  StockMovement, 
  StoreSettings, 
  MetricTrend, 
  HourlySalesPoint, 
  RevenueTrendPoint, 
  StockHealthItem 
} from '@/types';
import { INITIAL_SAMPLE_PRODUCTS } from '@/lib/seed';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

// Helper to get active store ID
const getActiveStoreId = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_user_id', user.id)
    .maybeSingle();

  return data?.id || null;
};

export const api = {
  getProducts: async (): Promise<Product[]> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (!storeId) return getLocal<Product[]>(PRODUCTS_KEY, []);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching products:', error);
        return getLocal<Product[]>(PRODUCTS_KEY, []);
      }
      return (data || []) as Product[];
    }

    return getLocal<Product[]>(PRODUCTS_KEY, []);
  },

  saveProduct: async (
    productData: Partial<Product> & { name: string; price: number; stock_quantity: number }
  ): Promise<Product> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const now = new Date().toISOString();
        let savedProd: Product;

        if (productData.id) {
          // Fetch existing product for stock diff calculation
          const { data: oldProd } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productData.id)
            .single();

          const diff = oldProd ? productData.stock_quantity - oldProd.stock_quantity : 0;

          const { data, error } = await supabase
            .from('products')
            .update({
              name: productData.name.trim(),
              category: productData.category || 'General',
              price: productData.price,
              cost_price: productData.cost_price,
              stock_quantity: productData.stock_quantity,
              low_stock_threshold: productData.low_stock_threshold ?? 5,
              unit_type: productData.unit_type || 'piece',
              attributes: productData.attributes || {},
              image_url: productData.image_url || '',
              updated_at: now,
            })
            .eq('id', productData.id)
            .select('*')
            .single();

          if (error) throw new Error(error.message);
          savedProd = data as Product;

          if (diff !== 0) {
            await supabase.from('stock_movements').insert({
              store_id: storeId,
              product_id: savedProd.id,
              product_name: savedProd.name,
              change_amount: diff,
              quantity_after: savedProd.stock_quantity,
              reason: 'MANUAL_ADJUSTMENT',
              note: 'Product stock updated in catalog',
              timestamp: now,
            });
          }
        } else {
          // Insert new product
          const { data, error } = await supabase
            .from('products')
            .insert({
              store_id: storeId,
              name: productData.name.trim(),
              category: productData.category || 'General',
              price: productData.price,
              cost_price: productData.cost_price,
              stock_quantity: productData.stock_quantity,
              low_stock_threshold: productData.low_stock_threshold ?? 5,
              unit_type: productData.unit_type || 'piece',
              attributes: productData.attributes || {},
              image_url: productData.image_url || '',
            })
            .select('*')
            .single();

          if (error) throw new Error(error.message);
          savedProd = data as Product;

          await supabase.from('stock_movements').insert({
            store_id: storeId,
            product_id: savedProd.id,
            product_name: savedProd.name,
            change_amount: savedProd.stock_quantity,
            quantity_after: savedProd.stock_quantity,
            reason: 'RESTOCK',
            note: 'Initial catalog item creation',
            timestamp: now,
          });
        }

        return savedProd;
      }
    }

    // Local Storage Fallback
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
      unit_type: productData.unit_type || 'piece',
      attributes: productData.attributes || {},
      image_url: productData.image_url || '',
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
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { error } = await supabase.from('products').delete().eq('id', id).eq('store_id', storeId);
        return !error;
      }
    }

    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const filtered = products.filter((p) => p.id !== id);
    setLocal(PRODUCTS_KEY, filtered);
    return true;
  },

  restockProduct: async (id: string, addQuantity: number, note?: string): Promise<Product> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { data: prod, error: getErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (getErr || !prod) throw new Error('Product not found');

        const newStock = Number(prod.stock_quantity) + addQuantity;
        const now = new Date().toISOString();

        const { data: updatedProd, error: updateErr } = await supabase
          .from('products')
          .update({ stock_quantity: newStock, updated_at: now })
          .eq('id', id)
          .select('*')
          .single();

        if (updateErr) throw new Error(updateErr.message);

        await supabase.from('stock_movements').insert({
          store_id: storeId,
          product_id: id,
          product_name: prod.name,
          change_amount: addQuantity,
          quantity_after: newStock,
          reason: 'RESTOCK',
          note: note || `Restocked +${addQuantity} units`,
          timestamp: now,
        });

        return updatedProd as Product;
      }
    }

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
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (!storeId) return getLocal<Sale[]>(SALES_KEY, []);

      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('store_id', storeId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching sales from Supabase:', error);
        return getLocal<Sale[]>(SALES_KEY, []);
      }

      return (salesData || []).map((s) => ({
        ...s,
        items: (s.sale_items as SaleItem[]) || [],
      })) as Sale[];
    }

    return getLocal<Sale[]>(SALES_KEY, []);
  },

  createSale: async (
    items: { product_id: string; quantity: number }[],
    paymentMethod: Sale['payment_method'] = 'CASH',
    notes?: string
  ): Promise<Sale> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { data, error } = await supabase.rpc('create_sale_transaction', {
          p_store_id: storeId,
          p_items: items,
          p_payment_method: paymentMethod,
          p_notes: notes || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data as Sale;
      }
    }

    // Local Storage Fallback (Offline/Demo)
    const products = getLocal<Product[]>(PRODUCTS_KEY, []);
    const sales = getLocal<Sale[]>(SALES_KEY, []);
    const movements = getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
    const now = new Date().toISOString();

    const saleId = `sale-${Date.now()}`;
    const saleNumber = `#INV-${Date.now().toString().slice(-6)}`;

    // Validate stock for local mock fallback
    for (const itemReq of items) {
      const product = products.find((p) => p.id === itemReq.product_id);
      if (!product) throw new Error(`Product not found`);
      if (product.stock_quantity < itemReq.quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}" (Available: ${product.stock_quantity}, Requested: ${itemReq.quantity})`
        );
      }
    }

    let totalAmount = 0;
    let totalItemsCount = 0;
    const saleItems: SaleItem[] = [];

    for (const itemReq of items) {
      const product = products.find((p) => p.id === itemReq.product_id)!;

      const lineTotal = Math.round(product.price * itemReq.quantity);
      totalAmount += lineTotal;
      totalItemsCount += itemReq.quantity;

      product.stock_quantity = product.stock_quantity - itemReq.quantity;
      product.updated_at = now;

      const saleItem: SaleItem = {
        id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sale_id: saleId,
        product_id: product.id,
        product_name: product.name,
        quantity: itemReq.quantity,
        unit_price: product.price,
        line_total: lineTotal,
        unit_type: product.unit_type || 'piece',
      };
      saleItems.push(saleItem);

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
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { data, error } = await supabase.rpc('void_sale_transaction', {
          p_store_id: storeId,
          p_sale_id: saleId,
          p_void_reason: reason,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data as Sale;
      }
    }

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
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (!storeId) return getLocal<StockMovement[]>(MOVEMENTS_KEY, []);

      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('store_id', storeId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching stock movements:', error);
        return getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
      }
      return (data || []) as StockMovement[];
    }

    return getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
  },

  getSettings: async (): Promise<StoreSettings> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();

        if (!error && data) {
          return {
            store_name: data.name,
            currency_symbol: data.currency_symbol,
            currency_code: data.currency_code,
            business_type: data.business_type,
            expiry_alert_days: data.expiry_alert_days,
            low_stock_alerts_enabled: true,
          };
        }
      }
    }

    return getLocal<StoreSettings>(SETTINGS_KEY, {
      store_name: 'Corner Mini-Market & Kiosk',
      currency_symbol: '$',
      currency_code: 'USD',
      low_stock_alerts_enabled: true,
      business_type: 'GENERAL_RETAIL',
      expiry_alert_days: 30,
      custom_attributes: [],
    });
  },

  updateSettings: async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const { data, error } = await supabase
          .from('stores')
          .update({
            name: settings.store_name,
            business_type: settings.business_type,
            currency_symbol: settings.currency_symbol,
            currency_code: settings.currency_code,
            expiry_alert_days: settings.expiry_alert_days,
            updated_at: new Date().toISOString(),
          })
          .eq('id', storeId)
          .select('*')
          .single();

        if (!error && data) {
          return {
            store_name: data.name,
            currency_symbol: data.currency_symbol,
            currency_code: data.currency_code,
            business_type: data.business_type,
            expiry_alert_days: data.expiry_alert_days,
            low_stock_alerts_enabled: true,
          };
        }
      }
    }

    const current = await api.getSettings();
    const updated = { ...current, ...settings };
    setLocal(SETTINGS_KEY, updated);
    return updated;
  },

  seedDemo: async (): Promise<Product[]> => {
    if (isSupabaseConfigured()) {
      const storeId = await getActiveStoreId();
      if (storeId) {
        const now = new Date().toISOString();
        const demoProductsToInsert = INITIAL_SAMPLE_PRODUCTS.map((p) => ({
          store_id: storeId,
          name: p.name,
          category: p.category,
          price: p.price,
          cost_price: p.cost_price,
          stock_quantity: p.stock_quantity,
          low_stock_threshold: p.low_stock_threshold,
          unit_type: p.unit_type || 'piece',
          attributes: p.attributes || {},
          image_url: p.image_url || '',
        }));

        const { data: insertedProds, error } = await supabase
          .from('products')
          .insert(demoProductsToInsert)
          .select('*');

        if (error) throw new Error(error.message);

        const movementsToInsert = (insertedProds || []).map((p) => ({
          store_id: storeId,
          product_id: p.id,
          product_name: p.name,
          change_amount: p.stock_quantity,
          quantity_after: p.stock_quantity,
          reason: 'RESTOCK' as const,
          note: 'Demo Kiosk catalog seed',
          timestamp: now,
        }));

        await supabase.from('stock_movements').insert(movementsToInsert);
        return insertedProds as Product[];
      }
    }

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

  // Analytics Helpers
  getMetricTrends: (sales: Sale[], daysPeriod: number = 1): {
    revenueTrend: MetricTrend;
    salesCountTrend: MetricTrend;
    unitsSoldTrend: MetricTrend;
  } => {
    const now = new Date();
    const currentStart = new Date(now.getTime() - daysPeriod * 86400000).getTime();
    const previousStart = new Date(now.getTime() - 2 * daysPeriod * 86400000).getTime();

    let curRev = 0, curSales = 0, curUnits = 0;
    let prevRev = 0, prevSales = 0, prevUnits = 0;

    sales.forEach((s) => {
      if (s.status !== 'COMPLETED') return;
      const t = new Date(s.timestamp).getTime();

      if (t >= currentStart) {
        curRev += s.total_amount;
        curSales += 1;
        curUnits += s.items_count;
      } else if (t >= previousStart && t < currentStart) {
        prevRev += s.total_amount;
        prevSales += 1;
        prevUnits += s.items_count;
      }
    });

    const calcPercent = (cur: number, prev: number): MetricTrend => {
      if (prev === 0) {
        return {
          currentValue: cur,
          previousValue: prev,
          percentageChange: cur > 0 ? 100 : 0,
          isIncrease: cur >= prev,
        };
      }
      const change = ((cur - prev) / prev) * 100;
      return {
        currentValue: cur,
        previousValue: prev,
        percentageChange: Math.round(change * 10) / 10,
        isIncrease: change >= 0,
      };
    };

    return {
      revenueTrend: calcPercent(curRev, prevRev),
      salesCountTrend: calcPercent(curSales, prevSales),
      unitsSoldTrend: calcPercent(curUnits, prevUnits),
    };
  },

  getRevenueTrendData: (sales: Sale[], days: number = 7): RevenueTrendPoint[] => {
    const points: RevenueTrendPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - days);

      const targetDateStr = targetDate.toDateString();
      const prevDateStr = prevDate.toDateString();

      let currentRev = 0;
      let prevRev = 0;

      sales.forEach((s) => {
        if (s.status !== 'COMPLETED') return;
        const dStr = new Date(s.timestamp).toDateString();
        if (dStr === targetDateStr) currentRev += s.total_amount;
        if (dStr === prevDateStr) prevRev += s.total_amount;
      });

      points.push({
        dateLabel: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timestamp: targetDate.toISOString(),
        currentPeriodRevenue: currentRev,
        previousPeriodRevenue: prevRev,
      });
    }

    return points;
  },

  getHourlySalesData: (sales: Sale[], daysRange: number = 7): HourlySalesPoint[] => {
    const hoursMap: Record<number, { count: number; revenue: number }> = {};
    for (let h = 8; h <= 21; h++) {
      hoursMap[h] = { count: 0, revenue: 0 };
    }

    const cutoff = new Date(Date.now() - daysRange * 86400000).getTime();

    sales.forEach((s) => {
      if (s.status !== 'COMPLETED') return;
      const d = new Date(s.timestamp);
      if (d.getTime() < cutoff) return;

      const hour = d.getHours();
      if (hoursMap[hour] !== undefined) {
        hoursMap[hour].count += 1;
        hoursMap[hour].revenue += s.total_amount;
      }
    });

    return Object.entries(hoursMap).map(([hStr, data]) => {
      const hourNum = parseInt(hStr, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = `${hourNum % 12 === 0 ? 12 : hourNum % 12} ${ampm}`;

      return {
        hour: formattedHour,
        hourNum,
        salesCount: data.count,
        revenue: data.revenue,
      };
    });
  },

  getStockHealthData: (products: Product[], expiryAlertDays: number = 30): StockHealthItem[] => {
    const now = Date.now();
    const items: StockHealthItem[] = [];

    products.forEach((p) => {
      const isLowStock = p.stock_quantity <= p.low_stock_threshold;
      let isExpiringSoon = false;
      let daysUntilExpiry: number | undefined = undefined;

      if (p.attributes?.expiry_date) {
        const expTime = new Date(p.attributes.expiry_date as string).getTime();
        if (!isNaN(expTime)) {
          const diffDays = Math.ceil((expTime - now) / 86400000);
          daysUntilExpiry = diffDays;
          if (diffDays <= expiryAlertDays) {
            isExpiringSoon = true;
          }
        }
      }

      if (isLowStock || isExpiringSoon) {
        const ratio = p.low_stock_threshold > 0 
          ? Math.min(1, Math.max(0, p.stock_quantity / (p.low_stock_threshold * 2)))
          : 0;

        items.push({
          product: p,
          currentStock: p.stock_quantity,
          threshold: p.low_stock_threshold,
          ratio,
          isLowStock,
          isExpiringSoon,
          daysUntilExpiry,
        });
      }
    });

    return items.sort((a, b) => {
      if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
      if (!a.isExpiringSoon && b.isExpiringSoon) return 1;
      return a.ratio - b.ratio;
    });
  },
};
