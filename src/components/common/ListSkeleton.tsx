'use client';

import React from 'react';

interface ListSkeletonProps {
  count?: number;
}

export default function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-agora-card border border-agora-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3"
        >
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 rounded-xl bg-agora-border/50 shrink-0" />

          {/* Title & Subtitle Skeleton */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-agora-border/60 rounded-md w-1/2" />
            <div className="h-3 bg-agora-border/40 rounded-md w-1/3" />
          </div>

          {/* Value Skeleton */}
          <div className="text-right space-y-2 shrink-0">
            <div className="h-4 bg-agora-border/60 rounded-md w-16 ml-auto" />
            <div className="h-3 bg-agora-border/40 rounded-md w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
