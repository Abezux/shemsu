import { RegisterClosure } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CLOSURES_KEY, getLocal, setLocal, getActiveStoreId } from './common';
import { getSales } from './sales';

export async function getRegisterClosures(): Promise<RegisterClosure[]> {
  if (isSupabaseConfigured()) {
    const storeId = await getActiveStoreId();
    if (!storeId) return [];

    const { data, error } = await supabase
      .from('register_closures')
      .select('*')
      .eq('store_id', storeId)
      .order('closed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch register closures: ${error.message}`);
    }
    return (data || []) as RegisterClosure[];
  }
  return getLocal<RegisterClosure[]>(CLOSURES_KEY, []);
}

export async function getExpectedCash(): Promise<{
  expectedCash: number;
  totalCashSales: number;
  totalCashRefunds: number;
  periodStart: string;
}> {
  const closures = await getRegisterClosures();
  const lastClosure = closures[0];
  const periodStart = lastClosure ? lastClosure.closed_at : new Date(0).toISOString();

  const sales = await getSales();
  const periodStartMs = new Date(periodStart).getTime();

  let totalCashSales = 0;
  let totalCashRefunds = 0;

  sales.forEach((s) => {
    const t = new Date(s.timestamp).getTime();
    if (t < periodStartMs || s.status === 'VOIDED') return;

    if (s.payments && s.payments.length > 0) {
      s.payments.forEach((p) => {
        if (p.method === 'CASH') {
          totalCashSales += p.amount;
        }
      });
    } else if (s.payment_method === 'CASH') {
      totalCashSales += s.total_amount;
    }

    if (s.items) {
      s.items.forEach((item) => {
        if (item.refunded_quantity && item.refunded_quantity > 0) {
          if (s.payment_method === 'CASH') {
            totalCashRefunds += Math.round(item.unit_price * item.refunded_quantity);
          }
        }
      });
    }
  });

  const expectedCash = Math.max(0, totalCashSales - totalCashRefunds);
  return {
    expectedCash,
    totalCashSales,
    totalCashRefunds,
    periodStart,
  };
}

export async function closeRegister(countedCash: number, notes?: string): Promise<RegisterClosure> {
  const { expectedCash, periodStart } = await getExpectedCash();
  const variance = countedCash - expectedCash;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const storeId = await getActiveStoreId();
    if (storeId) {
      const { data, error } = await supabase.rpc('close_register_transaction', {
        p_store_id: storeId,
        p_period_start: periodStart,
        p_counted_cash: countedCash,
        p_notes: notes || null,
      });

      if (!error && data) {
        return data as RegisterClosure;
      }

      // Fallback to direct insert if RPC is not present
      const { data: directData, error: directError } = await supabase
        .from('register_closures')
        .insert({
          store_id: storeId,
          period_start: periodStart,
          period_end: now,
          expected_cash: expectedCash,
          counted_cash: countedCash,
          variance,
          notes: notes || null,
          closed_at: now,
        })
        .select('*')
        .single();

      if (directError) throw new Error(directError.message);
      return directData as RegisterClosure;
    }
  }

  const closures = getLocal<RegisterClosure[]>(CLOSURES_KEY, []);
  const newClosure: RegisterClosure = {
    id: `closure-${Date.now()}`,
    period_start: periodStart,
    period_end: now,
    expected_cash: expectedCash,
    counted_cash: countedCash,
    variance,
    notes,
    closed_at: now,
  };

  closures.unshift(newClosure);
  setLocal(CLOSURES_KEY, closures);
  return newClosure;
}
