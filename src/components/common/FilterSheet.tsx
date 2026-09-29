'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import BottomSheet from './BottomSheet';

interface FilterSheetProps {
  activeCount?: number;
  title?: string;
  onReset?: () => void;
  children: React.ReactNode;
  triggerClassName?: string;
}

export default function FilterSheet({
  activeCount = 0,
  title = 'Filter Options',
  onReset,
  children,
  triggerClassName = '',
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Filter Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
          activeCount > 0
            ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
            : 'bg-agora-card border-agora-border text-agora-ink-muted hover:text-agora-ink hover:bg-agora-bg'
        } ${triggerClassName}`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-agora-terracotta text-agora-card text-[10px] font-black">
            {activeCount}
          </span>
        )}
      </button>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        headerRight={
          onReset && (
            <button
              type="button"
              onClick={() => {
                onReset();
              }}
              className="text-xs font-bold text-agora-ink-muted hover:text-agora-terracotta flex items-center gap-1 transition-colors px-2 py-1 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )
        }
      >
        <div className="space-y-5">
          {children}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
