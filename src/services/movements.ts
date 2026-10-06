import { StockMovement } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOVEMENTS_KEY, getLocal, getActiveStoreId } from './common';

export async function getStockMovements(): Promise<StockMovement[]> {
  if (isSupabaseConfigured()) {
    const storeId = await getActiveStoreId();
    if (!storeId) return [];

    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('store_id', storeId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch stock movements: ${error.message}`);
    }
    return (data || []) as StockMovement[];
  }

  return getLocal<StockMovement[]>(MOVEMENTS_KEY, []);
}
