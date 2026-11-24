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
  collapsed: '31dvh',
  half: '47dvh',
  expanded: '78dvh',
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
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

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

  // En escritorio (lg:), renderiza como isla flotante sólida de alto contraste
  if (isDesktop) {
    return (
      <aside
        className={`absolute top-4 left-4 z-20 flex flex-col w-[470px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-88px)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all duration-300 ease-out ${className}`}
      >
        {headerContent && (
          <div className="shrink-0 bg-slate-900/90 border-b border-slate-800">
            {headerContent}
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 custom-scrollbar">
          {children}
        </div>
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
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 rounded-t-3xl shadow-2xl ${className}`}
      style={{ willChange: 'height' }}
    >
      {/* Zona táctil superior de arrastre estilo DiDi / Uber */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="shrink-0 touch-none select-none cursor-grab active:cursor-grabbing lg:hidden"
      >
        <div className="flex items-center justify-center px-4 h-7">
          <button
            type="button"
            onClick={handleCycleSnap}
            aria-label={`Cambiar altura del panel (actual: ${SNAP_LABELS[activeSnap]})`}
            className="flex items-center justify-center min-h-[44px] min-w-[96px] -my-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80"
          >
            <span className="w-11 h-1.5 rounded-full bg-slate-600/90 hover:bg-amber-400 transition-colors" />
          </button>
        </div>
      </motion.div>

      {/* Cabecera fija solo en desktop (en móvil el contenido arranca limpio estilo DiDi/inDrive) */}
      {headerContent && (
        <div className="hidden lg:block shrink-0 px-4 pb-2 border-b border-slate-800/80">
          {headerContent}
        </div>
      )}

      {/* Contenido scrollable interno */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 pb-4 pt-1">
        {children}
      </div>
    </motion.section>
  );
}
