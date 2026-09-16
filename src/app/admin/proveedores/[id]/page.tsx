"use client"
import React, { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Box, Search, Plus, Trash2, Tag, Loader2, Save } from "lucide-react"
import Link from "next/link"

export default function ProveedorCatalogoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const proveedorId = resolvedParams.id
  const supabase = createClient()

  const [proveedor, setProveedor] = useState<any>(null)
  const [catalogo, setCatalogo] = useState<any[]>([])
  
  // Search Insumos
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoadingInitial(true)
    // 1. Get proveedor
    const { data: provData } = await supabase.from('proveedores').select('*').eq('id', proveedorId).single()
    if (provData) setProveedor(provData)

    // 2. Get catalogo
    fetchCatalogo()
  }

  const fetchCatalogo = async () => {
    const { data } = await supabase
      .from('proveedor_insumos')
      .select('*, insumos(*)')
      .eq('proveedor_id', proveedorId)
    
    if (data) {
      setCatalogo(data)
    }
    setLoadingInitial(false)
  }

    // Auto-search effect
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      executeSearch(searchTerm);
    }, 350); // 350ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, catalogo]);

  const executeSearch = async (term: string) => {
    setSearching(true);
    const { data } = await supabase
      .from('insumos')
      .select('*')
      .ilike('nombre', `%${term}%`)
      .limit(50);
      
    if (data) {
      const existingIds = catalogo.map(c => c.insumo_id);
      setSearchResults(data.filter(ins => !existingIds.includes(ins.id)));
    }
    setSearching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAddInsumo = async (insumo: any) => {
    const { data, error } = await supabase
      .from('proveedor_insumos')
      .insert({
        proveedor_id: proveedorId,
        insumo_id: insumo.id,
        precio_cotizado: insumo.precio_sin_iva
      })
      .select()
      
    if (!error && data) {
      // Update local state by fetching again
      fetchCatalogo()
      setSearchResults(prev => prev.filter(i => i.id !== insumo.id))
    }
  }

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('proveedor_insumos').delete().eq('id', id)
    if (!error) {
      setCatalogo(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleUpdatePrice = async (id: string, newPrice: number) => {
    setCatalogo(prev => prev.map(c => c.id === id ? { ...c, precio_cotizado: newPrice } : c))
    await supabase.from('proveedor_insumos').update({ precio_cotizado: newPrice }).eq('id', id)
  }

  if (loadingInitial) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-sage" size={40} /></div>

  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/proveedores" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            <Box className="text-brand-sage" /> Catálogo del Proveedor
          </h1>
          <p className="text-gray-500 font-medium">Proveedor: <span className="text-brand-dark">{proveedor?.razon_social}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Current Catalog */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-brand-sage" /> Insumos Asignados ({catalogo.length})
          </h2>
          
          {catalogo.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">Este proveedor aún no tiene insumos asignados.</p>
              <p className="text-sm text-gray-400 mt-1">Busca a la derecha y agrégalos.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {catalogo.map(item => {
                const insObj = Array.isArray(item.insumos) ? item.insumos[0] : item.insumos
                return (
                  <div key={item.id} className="p-3 border border-gray-100 rounded-xl hover:border-brand-sage/30 transition-colors flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm leading-tight">{insObj?.nombre}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{insObj?.codigo} • Unidad: {insObj?.unidad}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium text-sm">$</span>
                        <input 
                          type="number" 
                          step="0.0001" 
                          min="0"
                          className="w-20 bg-transparent outline-none font-bold text-gray-800 text-right text-sm"
                          value={item.precio_cotizado}
                          onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Quitar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Search Database */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Buscar en Base de Datos Global</h2>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nombre de material o equipo..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-brand-sage focus:ring-0 outline-none transition-colors"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" disabled={searching} className="bg-brand-dark text-white px-4 py-2 rounded-xl hover:bg-opacity-90 font-medium disabled:opacity-50">
              {searching ? <Loader2 className="animate-spin" size={18} /> : "Buscar"}
            </button>
          </form>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {searchResults.map(ins => (
              <div key={ins.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-sm">{ins.nombre}</div>
                  <div className="text-xs text-gray-400">P. Referencial: ${Number(ins.precio_sin_iva).toFixed(4)} • Unidad: {ins.unidad}</div>
                </div>
                <button 
                  onClick={() => handleAddInsumo(ins)}
                  className="bg-brand-sage/10 text-brand-sage hover:bg-brand-sage hover:text-brand-dark p-2 rounded-lg transition-colors font-medium flex items-center gap-1 text-sm"
                >
                  <Plus size={16} /> Añadir
                </button>
              </div>
            ))}
            {searchResults.length === 0 && !searching && searchTerm && (
              <p className="text-center text-gray-400 py-10 text-sm">No se encontraron resultados nuevos.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
