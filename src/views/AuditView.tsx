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
          <span className="px-2.5 py-1 rounded-full bg-agora-bg text-agora-ink text-[11px] font-bold border border-agora-border flex items-center gap-1 w-max">
            <ShoppingCart className="w-3 h-3 text-agora-terracotta" /> Sale Entry
          </span>
        );
      case 'RESTOCK':
        return (
          <span className="px-2.5 py-1 rounded-full bg-agora-sage-light border border-agora-sage-border text-agora-sage text-[11px] font-bold flex items-center gap-1 w-max">
            <PlusCircle className="w-3 h-3 text-agora-sage" /> Restock
          </span>
        );
      case 'VOID_SALE':
        return (
          <span className="px-2.5 py-1 rounded-full bg-agora-brick-light border border-agora-brick-border text-agora-brick text-[11px] font-bold flex items-center gap-1 w-max">
            <RotateCcw className="w-3 h-3 text-agora-brick" /> Void Sale
          </span>
        );
      case 'MANUAL_ADJUSTMENT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-agora-brass-light border border-agora-brass-border text-agora-brass text-[11px] font-bold flex items-center gap-1 w-max">
            <Edit3 className="w-3 h-3 text-agora-brass" /> Catalog Edit
          </span>
        );
      default:
        return <span className="text-agora-ink-muted">{reason}</span>;
    }
  };

  return (
    <div className="space-y-6 text-agora-ink">
      <div>
        <h1 className="text-2xl font-serif font-black text-agora-ink tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-agora-terracotta" />
          Stock Movement Ledger Audit Log
        </h1>
        <p className="text-xs text-agora-ink-muted mt-0.5 font-medium">
          Complete immutable ledger history of every inventory movement (sales, restocks, voided entries, and catalog edits)
        </p>
      </div>

      <div className="ledger-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-agora-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, note, or reference ID..."
              className="w-full bg-agora-bg border border-agora-border rounded-xl py-2 pl-9 pr-4 text-xs text-agora-ink focus:outline-none focus:border-agora-terracotta"
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
                    ? 'bg-agora-terracotta text-agora-card'
                    : 'bg-agora-card border border-agora-border text-agora-ink-muted hover:text-agora-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Line Style Table */}
      <div className="ledger-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-agora-bg/80 border-b border-agora-border text-agora-ink-muted uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Event Reason</th>
                <th className="p-4">Stock Change</th>
                <th className="p-4">Stock Balance After</th>
                <th className="p-4">Note / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agora-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-agora-ink-muted">
                    Loading stock audit trail logs...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-agora-ink-muted">
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isPositive = m.change_amount > 0;

                  return (
                    <tr key={m.id} className="ledger-row">
                      <td className="p-4 text-agora-ink-muted font-medium whitespace-nowrap">
                        {formatDate(m.timestamp)}
                      </td>

                      <td className="p-4 font-bold text-agora-ink text-sm">
                        {m.product_name}
                      </td>

                      <td className="p-4">{getReasonBadge(m.reason)}</td>

                      <td className="p-4">
                        <span
                          className={`font-serif font-bold text-sm inline-flex items-center gap-0.5 ${
                            isPositive ? 'text-agora-sage' : 'text-agora-terracotta'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-agora-sage" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-agora-terracotta" />
                          )}
                          {isPositive ? `+${m.change_amount}` : m.change_amount} units
                        </span>
                      </td>

                      <td className="p-4 font-serif font-bold text-agora-ink">
                        {m.quantity_after} units
                      </td>

                      <td className="p-4 text-agora-ink-muted max-w-xs truncate font-medium">
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
