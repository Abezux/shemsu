import React from 'react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { AlertTriangle, PackageX, Calendar } from 'lucide-react';

interface ProductTileProps {
  product: Product;
  currencySymbol: string;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
}

export default function ProductTile({
  product,
  currencySymbol,
  cartQuantity,
  onAddToCart,
}: ProductTileProps) {
  const remainingStock = product.stock_quantity - cartQuantity;
  const isOut = remainingStock <= 0;
  const isLowStock = !isOut && remainingStock <= product.low_stock_threshold;
  const unitLabel = product.unit_type && product.unit_type !== 'piece' ? product.unit_type : '';
  const expDate = product.attributes?.expiry_date ? new Date(product.attributes.expiry_date as string) : null;

  return (
    <button
      type="button"
      onClick={() => !isOut && onAddToCart(product)}
      disabled={isOut}
      className={`relative group text-left w-full p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between select-none ${
        isOut
          ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
          : isLowStock
          ? 'bg-slate-900 border-amber-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.98]'
          : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.98]'
      }`}
    >
      {/* Top row: Image icon & category tag */}
      <div className="flex items-start justify-between gap-2 mb-2 w-full">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
          {product.image_url || '📦'}
        </div>

        {cartQuantity > 0 && (
          <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-pulse">
            {cartQuantity} {unitLabel} in cart
          </span>
        )}
      </div>

      {/* Middle: Product Name & Category */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-0.5">
            {product.category}
          </span>
          {expDate && (
            <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" /> Exp: {expDate.toLocaleDateString(undefined, { month: 'short' })}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Bottom: Price & Stock Badge */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between w-full">
        <span className="text-emerald-400 font-bold text-base">
          {formatCurrency(product.price, currencySymbol)} {unitLabel && <span className="text-xs font-normal text-slate-400">/{unitLabel}</span>}
        </span>

        <div className="flex items-center gap-1">
          {isOut ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              <PackageX className="w-3 h-3" /> Out
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" /> {remainingStock} {unitLabel || 'left'}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              {remainingStock} {unitLabel || 'in stock'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
