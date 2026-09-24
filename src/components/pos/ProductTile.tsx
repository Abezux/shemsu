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
      className={`relative group text-left w-full p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between select-none ${
        isOut
          ? 'bg-agora-bg/60 border-agora-border opacity-50 cursor-not-allowed'
          : isLowStock
          ? 'bg-agora-card border-agora-terracotta/40 hover:border-agora-terracotta shadow-sm hover:shadow-md active:scale-[0.98]'
          : 'bg-agora-card border-agora-border hover:border-agora-brass hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {/* Top row: Image icon & category tag */}
      <div className="flex items-start justify-between gap-2 mb-2.5 w-full">
        <div className="w-10 h-10 rounded-xl bg-agora-bg border border-agora-border flex items-center justify-center text-xl shrink-0 shadow-inner">
          {product.image_url || '📦'}
        </div>

        {cartQuantity > 0 && (
          <span className="bg-agora-terracotta text-agora-card font-bold text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            {cartQuantity} {unitLabel} in cart
          </span>
        )}
      </div>

      {/* Middle: Product Name & Category */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-agora-brass block mb-0.5">
            {product.category}
          </span>
          {expDate && (
            <span className="text-[9px] text-agora-terracotta font-bold flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" /> Exp: {expDate.toLocaleDateString(undefined, { month: 'short' })}
            </span>
          )}
        </div>

        <h3 className="font-bold text-agora-ink text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Bottom: Price & Stock Badge */}
      <div className="pt-2.5 border-t border-agora-border/70 flex items-center justify-between w-full">
        <span className="font-serif font-bold text-agora-terracotta text-base">
          {formatCurrency(product.price, currencySymbol)} {unitLabel && <span className="text-xs font-sans font-normal text-agora-ink-muted">/{unitLabel}</span>}
        </span>

        <div className="flex items-center gap-1">
          {isOut ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-agora-brick bg-agora-brick-light px-2 py-0.5 rounded-md border border-agora-brick-border">
              <PackageX className="w-3 h-3" /> Out
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-agora-terracotta bg-agora-terracotta-light px-2 py-0.5 rounded-md border border-agora-terracotta-border">
              <AlertTriangle className="w-3 h-3" /> {remainingStock} {unitLabel || 'left'}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-agora-ink-muted">
              {remainingStock} {unitLabel || 'in stock'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
