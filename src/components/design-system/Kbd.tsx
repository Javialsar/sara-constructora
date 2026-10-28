'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-semibold",
        "text-slate-400 bg-slate-900/80 border border-slate-700/60 rounded shadow-xs",
        "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
