import React from 'react';
import { Image, Monitor, Smartphone } from 'lucide-react';

export interface ImagePlaceholderProps {
  /** The descriptive label displayed inside the placeholder box */
  label: string;
  /** Aspect ratio string, e.g. '16/9', '4/3', '9/16', '4/5', '3/2', '16/10' */
  aspectRatio?: string;
  /** Alt text for screen readers */
  altText: string;
  /** Additional CSS classes */
  className?: string;
  /** Set true for above-the-fold hero images to load eagerly */
  priority?: boolean;
  /** Device frame type overlay */
  deviceFrame?: 'phone' | 'desktop' | 'none';
  /** Dark theme variant for dark background sections */
  darkTheme?: boolean;
}

export default function ImagePlaceholder({
  label,
  aspectRatio = '16/10',
  altText,
  className = '',
  priority = false,
  deviceFrame = 'none',
  darkTheme = false,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={altText}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        darkTheme
          ? 'bg-agora-ink/80 border border-white/15 text-agora-card hover:border-white/30 hover:shadow-2xl'
          : 'bg-agora-card border border-agora-border text-agora-ink hover:border-agora-terracotta/40 hover:shadow-xl'
      } ${className}`}
      style={{ aspectRatio }}
    >
      {/* Device Frame Simulation Header (Desktop or Phone) */}
      {deviceFrame === 'desktop' && (
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono ${
            darkTheme
              ? 'bg-white/5 border-white/10 text-white/50'
              : 'bg-agora-bg border-agora-border text-agora-ink-muted'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-agora-brick/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-agora-gold/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-agora-sage/60" />
          </div>
          <span className="truncate max-w-[200px]">agora.app/register</span>
          <div className="w-10" />
        </div>
      )}

      {deviceFrame === 'phone' && (
        <div
          className={`px-4 py-1.5 border-b flex items-center justify-between text-[10px] ${
            darkTheme
              ? 'bg-white/5 border-white/10 text-white/50'
              : 'bg-agora-bg border-agora-border text-agora-ink-muted'
          }`}
        >
          <span>9:41</span>
          <div className="w-12 h-1.5 rounded-full bg-current opacity-30" />
          <span>100%</span>
        </div>
      )}

      {/* Background UI Grid Wires simulation */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-[0.03] ${
          darkTheme
            ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]'
            : 'bg-[radial-gradient(#211d1a_1px,transparent_1px)]'
        } [background-size:16px_16px]`}
      />

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${
            darkTheme
              ? 'bg-white/10 text-agora-terracotta border border-white/15'
              : 'bg-agora-bg text-agora-terracotta border border-agora-border'
          }`}
        >
          {deviceFrame === 'phone' ? (
            <Smartphone className="w-6 h-6" />
          ) : deviceFrame === 'desktop' ? (
            <Monitor className="w-6 h-6" />
          ) : (
            <Image className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1 max-w-md">
          <p
            className={`font-mono text-xs font-semibold px-3 py-1 rounded-lg border inline-block ${
              darkTheme
                ? 'bg-white/5 border-white/10 text-agora-card/90'
                : 'bg-agora-bg border-agora-border text-agora-ink'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-[11px] leading-relaxed max-w-xs mx-auto ${
              darkTheme ? 'text-white/50' : 'text-agora-ink-muted'
            }`}
          >
            Placeholder reserved for high-resolution app screenshot. Aspect ratio fixed.
          </p>
        </div>
      </div>
    </div>
  );
}
