'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, X, Check, MapPin } from 'lucide-react';

export interface SavedPlaceItem {
  id: string;
  label: string;
  icon: string;
  address: string;
  lat: number;
  lng: number;
}

export interface SaraSavedPlacesBarProps {
  onSelectPlace: (place: SavedPlaceItem) => void;
  currentDestination?: { nombre: string; lat: number; lng: number } | null;
  compact?: boolean;
}

const STORAGE_KEY = 'sara_fletes_saved_places_v1';

const PRESET_IDS = new Set(['preset-casa', 'preset-trabajo', 'preset-obra']);

const DEFAULT_SAVED_PLACES: SavedPlaceItem[] = [
  {
    id: 'preset-casa',
    label: 'Casa',
    icon: '🏠',
    address: 'Av. Universitaria y 18 de Noviembre, Loja',
    lat: -3.99313,
    lng: -79.20422,
  },
  {
    id: 'preset-trabajo',
    label: 'Trabajo',
    icon: '💼',
    address: 'Av. Emiliano Ortega y Rocafuerte, Loja',
    lat: -4.00185,
    lng: -79.20145,
  },
  {
    id: 'preset-obra',
    label: 'Obra Principal',
    icon: '🏗️',
    address: 'Frente de Obra GRUPO SARA, Cariamanga',
    lat: -4.3285,
    lng: -79.556,
  },
];

const ICON_OPTIONS = ['📍', '🏠', '💼', '🏗️', '📦', '🏭', '⭐'] as const;

function isValidSavedPlace(item: unknown): item is SavedPlaceItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.icon === 'string' &&
    typeof candidate.address === 'string' &&
    typeof candidate.lat === 'number' &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === 'number' &&
    Number.isFinite(candidate.lng)
  );
}

export default function SaraSavedPlacesBar({
  onSelectPlace,
  currentDestination = null,
  compact = false,
}: SaraSavedPlacesBarProps) {
  const [places, setPlaces] = useState<SavedPlaceItem[]>(DEFAULT_SAVED_PLACES);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newIcon, setNewIcon] = useState<string>('📍');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Cargar lugares persistidos en localStorage al montar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_PLACES));
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(isValidSavedPlace);
        if (valid.length > 0) {
          setPlaces(valid);
        }
      }
    } catch {
      setPlaces(DEFAULT_SAVED_PLACES);
    }
  }, []);

  const persistPlaces = useCallback((updated: SavedPlaceItem[]) => {
    setPlaces(updated);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignorar errores de cuota de almacenamiento
      }
    }
  }, []);

  const showTransientFeedback = useCallback((msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  const handleOpenAddForm = useCallback(() => {
    if (!currentDestination) {
      showTransientFeedback('Selecciona un destino primero para guardarlo.');
      return;
    }
    const suggested = currentDestination.nombre.split(',')[0]?.trim().slice(0, 22) || 'Mi Destino';
    setNewLabel(suggested);
    setNewIcon('📍');
    setIsAdding(true);
  }, [currentDestination, showTransientFeedback]);

  const handleSaveNewPlace = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentDestination) return;

      const cleanLabel = newLabel.trim();
      if (!cleanLabel) return;

      const nextItem: SavedPlaceItem = {
        id: `custom-${Date.now()}`,
        label: cleanLabel,
        icon: newIcon,
        address: currentDestination.nombre,
        lat: Number(currentDestination.lat.toFixed(6)),
        lng: Number(currentDestination.lng.toFixed(6)),
      };

      persistPlaces([...places, nextItem]);
      setIsAdding(false);
      setNewLabel('');
      showTransientFeedback(`"${cleanLabel}" guardado en favoritos.`);
    },
    [currentDestination, newIcon, newLabel, persistPlaces, places, showTransientFeedback]
  );

  const handleDeletePlace = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (PRESET_IDS.has(id)) return;
      const next = places.filter((p) => p.id !== id);
      persistPlaces(next);
    },
    [persistPlaces, places]
  );

  const isPlaceActive = useCallback(
    (place: SavedPlaceItem): boolean => {
      if (!currentDestination) return false;
      const latDiff = Math.abs(place.lat - currentDestination.lat);
      const lngDiff = Math.abs(place.lng - currentDestination.lng);
      return latDiff < 0.0006 && lngDiff < 0.0006;
    },
    [currentDestination]
  );

  return (
    <div className="w-full space-y-2">
      {/* Barra horizontal deslizable de 1 toque */}
      <div
        role="list"
        aria-label="Destinos favoritos de 1 toque"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {places.map((place) => {
          const active = isPlaceActive(place);
          const isCustom = !PRESET_IDS.has(place.id);
          return (
            <div
              key={place.id}
              role="listitem"
              className="shrink-0 flex items-center"
            >
              <button
                type="button"
                onClick={() => onSelectPlace(place)}
                title={`${place.label} — ${place.address}`}
                className={`group flex items-center gap-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  compact ? 'min-h-[40px] px-2.5 py-1.5 text-xs' : 'min-h-[44px] px-3 py-2 text-xs'
                } ${
                  active
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 text-slate-200 hover:text-white'
                }`}
              >
                <span className="text-sm leading-none" aria-hidden="true">
                  {place.icon}
                </span>
                <span className="font-bold whitespace-nowrap max-w-[120px] truncate">
                  {place.label}
                </span>

                {isCustom && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Eliminar favorito ${place.label}`}
                    onClick={(e) => handleDeletePlace(place.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDeletePlace(place.id, e as unknown as React.MouseEvent);
                      }
                    }}
                    className="ml-0.5 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Botón "+ Guardar" para persistir el destino actual */}
        <button
          type="button"
          onClick={handleOpenAddForm}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border border-dashed font-bold transition-all cursor-pointer active:scale-95 ${
            compact ? 'min-h-[40px] px-2.5 py-1.5 text-xs' : 'min-h-[44px] px-3 py-2 text-xs'
          } ${
            currentDestination
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400'
              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Guardar</span>
        </button>
      </div>

      {/* Micro-formulario inline elegante (sin window.alert ni window.prompt) */}
      {isAdding && currentDestination && (
        <form
          onSubmit={handleSaveNewPlace}
          className="rounded-2xl bg-slate-900/95 border border-slate-700/90 p-3 shadow-xl space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{currentDestination.nombre}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label="Cerrar formulario de favorito"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector rápido de ícono */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {ICON_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewIcon(emoji)}
                className={`min-w-[36px] min-h-[36px] rounded-lg border flex items-center justify-center text-sm transition-all cursor-pointer ${
                  newIcon === emoji
                    ? 'bg-amber-500/20 border-amber-400 scale-105'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ej. Bodega Norte, Obra Sur..."
              maxLength={28}
              autoFocus
              className="flex-1 min-h-[44px] rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!newLabel.trim()}
              className="min-h-[44px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      )}

      {/* Feedback sutil inline */}
      {feedbackMsg && (
        <p className="text-[11px] font-medium text-amber-300/90 px-1">
          {feedbackMsg}
        </p>
      )}
    </div>
  );
}
