"use client"
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Loader2, X } from "lucide-react";

export default function AsyncSelect(props: any) { const {} = props; {
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<any>(null);

  // Inicializar valor de búsqueda si cambia el item seleccionado desde afuera
  useEffect(() => {
    if (value && typeof value === 'object') {
       setSearch(displayFormat(value));
    } else if (!value) {
       setSearch('');
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || search.length < 2) {
      setOptions([]);
      return;
    }
    
    // Si la busqueda es igual al display del value actual, no buscamos
    if (value && typeof value === 'object' && displayFormat(value) === search) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      let query = supabase.from(table).select(selectFields).limit(30);
      
      if (searchColumns.length > 0) {
        const orQuery = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',');
        query = query.or(orQuery);
      }

      if (extraFilter) {
         query = query.filter(extraFilter.column, extraFilter.operator, extraFilter.value);
      }

      const { data } = await query;
      if (data) setOptions(data);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search, isOpen]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange(null);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            // Trigger load if empty? Only if we want to show recents.
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border rounded-lg px-4 py-2 outline-none focus:border-brand-sage ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
        />
        {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
        {!loading && search && (
           <button type="button" onClick={(e) => { e.stopPropagation(); setSearch(''); onChange(null); setOptions([]); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(option);
                setSearch(displayFormat(option));
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-brand-sage/10 cursor-pointer text-sm text-gray-700"
            >
              {displayFormat(option)}
            </li>
          ))}
        </ul>
      )}
      {isOpen && search.length >= 2 && options.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500 text-center">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}
