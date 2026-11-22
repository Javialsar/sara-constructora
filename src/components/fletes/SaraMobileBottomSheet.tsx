'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';

export type BottomSheetSnapPoint = 'collapsed' | 'half' | 'expanded';

export interface SaraMobileBottomSheetProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  snapPoint?: BottomSheetSnapPoint;
  onSnapChange?: (snap: BottomSheetSnapPoint) => void;
  className?: string;
}

const SNAP_HEIGHTS: Record<BottomSheetSnapPoint, string> = {
  collapsed: '20vh',
  half: '52vh',
  expanded: '86vh',
};

const SNAP_ORDER: BottomSheetSnapPoint[] = ['collapsed', 'half', 'expanded'];

const SNAP_LABELS: Record<BottomSheetSnapPoint, string> = {
  collapsed: 'Minimizado',
  half: 'Vista media',
  expanded: 'Expandido',
};

export default function SaraMobileBottomSheet({
  children,
  headerContent,
  snapPoint,
  onSnapChange,
  className = '',
}: SaraMobileBottomSheetProps) {
  const [internalSnap, setInternalSnap] = useState<BottomSheetSnapPoint>(snapPoint ?? 'half');
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const activeSnap: BottomSheetSnapPoint = snapPoint ?? internalSnap;

  useEffect(() => {
    if (snapPoint !== undefined) {
      setInternalSnap(snapPoint);
    }
  }, [snapPoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setIsDesktop(mediaQuery.matches);
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateSnap = useCallback(
    (next: BottomSheetSnapPoint) => {
      if (snapPoint === undefined) {
        setInternalSnap(next);
      }
      onSnapChange?.(next);
    },
    [onSnapChange, snapPoint]
  );

  const handleCycleSnap = useCallback(() => {
    const idx = SNAP_ORDER.indexOf(activeSnap);
    const next = SNAP_ORDER[(idx + 1) % SNAP_ORDER.length];
    updateSnap(next);
  }, [activeSnap, updateSnap]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offsetY = info.offset.y;
      const velocityY = info.velocity.y;
      const currentIdx = SNAP_ORDER.indexOf(activeSnap);

      // Arrastre hacia arriba -> expandir
      if (offsetY < -45 || velocityY < -320) {
        const nextIdx = Math.min(SNAP_ORDER.length - 1, currentIdx + 1);
        updateSnap(SNAP_ORDER[nextIdx]);
        return;
      }

      // Arrastre hacia abajo -> colapsar
      if (offsetY > 45 || velocityY > 320) {
        const nextIdx = Math.max(0, currentIdx - 1);
        updateSnap(SNAP_ORDER[nextIdx]);
        return;
      }
    },
    [activeSnap, updateSnap]
  );

  // En escritorio (lg:), renderiza como contenedor lateral limpio sin interferir con el layout
  if (isDesktop) {
    return (
      <aside className={`flex flex-col h-full w-full ${className}`}>
        {headerContent && <div className="shrink-0">{headerContent}</div>}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </aside>
    );
  }

  return (
    <motion.section
      aria-label="Panel táctil SARA-FLETES"
      initial={false}
      animate={{ height: SNAP_HEIGHTS[activeSnap] }}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 36,
        mass: 0.85,
      }}
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 rounded-t-3xl shadow-2xl lg:static lg:inset-auto lg:z-auto lg:h-full lg:rounded-none lg:border-t-0 lg:shadow-none ${className}`}
      style={{ willChange: 'height' }}
    >
      {/* Zona táctil superior de arrastre (≥44px de altura) */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="shrink-0 touch-none select-none cursor-grab active:cursor-grabbing lg:hidden"
      >
        <div className="flex items-center justify-between px-4 min-h-[44px]">
          {/* Espaciador izquierdo para centrar el pill */}
          <div className="w-16 flex items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {SNAP_LABELS[activeSnap]}
            </span>
          </div>

          {/* Botón táctil central con pill handle (área táctil >= 44px) */}
          <button
            type="button"
            onClick={handleCycleSnap}
            aria-label={`Cambiar altura del panel (actual: ${SNAP_LABELS[activeSnap]})`}
            className="flex items-center justify-center min-h-[44px] min-w-[72px] -my-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80"
          >
            <span className="w-12 h-1.5 rounded-full bg-slate-600/90 hover:bg-amber-400 transition-colors" />
          </button>

          {/* Indicadores rápidos de snap */}
          <div className="w-16 flex items-center justify-end gap-1.5">
            {SNAP_ORDER.map((point) => {
              const isActive = activeSnap === point;
              return (
                <button
                  key={point}
                  type="button"
                  onClick={() => updateSnap(point)}
                  aria-label={`Ajustar panel a ${SNAP_LABELS[point]}`}
                  className="flex items-center justify-center w-6 h-6 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80"
                >
                  <span
                    className={`block rounded-full transition-all ${
                      isActive
                        ? 'w-2.5 h-2.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                        : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Cabecera fija opcional (siempre visible incluso en modo colapsado) */}
      {headerContent && (
        <div className="shrink-0 px-4 pb-2 border-b border-slate-800/80">
          {headerContent}
        </div>
      )}

      {/* Contenido scrollable interno */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
        {children}
      </div>
    </motion.section>
  );
}
