'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeocodedPoint } from '@/lib/services/saraFreightRoutingService';

export interface FletesFormDraft {
  originText: string;
  destinationText: string;
  originPoint: GeocodedPoint | null;
  destinationPoint: GeocodedPoint | null;
  material: string;
  weight: number;
  unitType: 'TON' | 'M3';
  helpersCount: number;
  tasaBotaderoEnabled: boolean;
  proposedPrice: number | null;
  sacosCementoCount?: number;
  activeStep: number;
}

const STORAGE_KEY = 'sara_fletes_form_draft_v2';

const DEFAULT_DRAFT: FletesFormDraft = {
  originText: '',
  destinationText: '',
  originPoint: null,
  destinationPoint: null,
  material: 'Arena / Ripio',
  weight: 1,
  unitType: 'TON',
  helpersCount: 0,
  tasaBotaderoEnabled: false,
  proposedPrice: null,
  sacosCementoCount: 20,
  activeStep: 1
};

export function useFletesFormPersistence() {
  const [draft, setDraftState] = useState<FletesFormDraft>(DEFAULT_DRAFT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraftState(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Error reading SARA-FLETES draft from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateDraft = useCallback((patch: Partial<FletesFormDraft>) => {
    setDraftState(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Error saving SARA-FLETES draft to localStorage:', e);
      }
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState(DEFAULT_DRAFT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing SARA-FLETES draft:', e);
    }
  }, []);

  return {
    draft,
    isLoaded,
    updateDraft,
    resetDraft
  };
}
