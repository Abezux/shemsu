import React, { useState, useEffect, useMemo } from 'react';
import { StockMovement, MovementReason } from '@/types';
import { api } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { FileText, Search, PlusCircle, ShoppingCart, RotateCcw, Edit3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AuditView() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStockMovements();
      setMovements(data);
    } catch (err) {
      console.error('Error loading audit log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesReason = reasonFilter === 'ALL' || m.reason === reasonFilter;
      const matchesSearch =
        m.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.reference_id || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesReason && matchesSearch;
    });
  }, [movements, reasonFilter, searchQuery]);

  const getReasonBadge = (reason: MovementReason) => {
    switch (reason) {
      case 'SALE':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1 w-max">
            <ShoppingCart className="w-3 h-3 text-slate-400" /> Sale
          </span>
        );
      case 'RESTOCK':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 w-max">
            <PlusCircle className="w-3 h-3 text-emerald-400" /> Restock
          </span>
        );
      case 'VOID_SALE':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center gap-1 w-max">
            <RotateCcw className="w-3 h-3 text-rose-400" /> Void Sale
          </span>
        );
      case 'MANUAL_ADJUSTMENT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 w-max">
            <Edit3 className="w-3 h-3 text-amber-400" /> Catalog Edit
          </span>
        );
      default:
        return <span className="text-slate-400">{reason}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-emerald-400" />
          Stock Movement Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete immutable audit history of every stock change (sales, restocks, voided sales, and catalog edits)
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, note, or reference ID..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Movements' },
              { id: 'SALE', label: 'Sales' },
              { id: 'RESTOCK', label: 'Restocks' },
              { id: 'VOID_SALE', label: 'Voided Sales' },
              { id: 'MANUAL_ADJUSTMENT', label: 'Manual Edits' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReasonFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  reasonFilter === f.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Event Reason</th>
                <th className="p-4">Stock Change</th>
                <th className="p-4">Stock Balance After</th>
                <th className="p-4">Note / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading stock audit trail logs...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isPositive = m.change_amount > 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4 text-slate-400 font-medium whitespace-nowrap">
                        {formatDate(m.timestamp)}
                      </td>

                      <td className="p-4 font-bold text-slate-100 text-sm">
                        {m.product_name}
                      </td>

                      <td className="p-4">{getReasonBadge(m.reason)}</td>

                      <td className="p-4">
                        <span
                          className={`font-black text-sm inline-flex items-center gap-0.5 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-rose-400" />
                          )}
                          {isPositive ? `+${m.change_amount}` : m.change_amount} units
                        </span>
                      </td>

                      <td className="p-4 font-bold text-slate-200">
                        {m.quantity_after} units
                      </td>

                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {m.note || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
