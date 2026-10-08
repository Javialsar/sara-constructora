"use client"

import React, { useState } from "react"
import { Search, ShoppingCart, Filter, Star, Truck, Building2, PackageCheck } from "lucide-react"

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Mock products for the B2B Construction Marketplace
  const products = [
    { id: 1, name: "Cemento Portland Tipo 1 (50kg)", provider: "Holcim Ecuador", price: 8.50, category: "Obra Gris", rating: 4.8, stock: "Alto", deliveryTime: "24h", imgUrl: "https://images.unsplash.com/photo-1621644788328-910ab38cc3db?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 2, name: "Varilla Corrugada 12mm x 12m", provider: "Adelca", price: 11.20, category: "Acero", rating: 4.9, stock: "Medio", deliveryTime: "48h", imgUrl: "https://images.unsplash.com/photo-1590496739956-6218e8aebcc2?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 3, name: "Hormigón Premezclado f'c 210 kg/cm2", provider: "Hormigonera Quito", price: 95.00, category: "Hormigón", rating: 4.7, stock: "Bajo Pedido", deliveryTime: "Agendado", imgUrl: "https://images.unsplash.com/photo-1541888052136-11f810168fbc?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 4, name: "Bloque de Hormigón 15x20x40", provider: "Bloques del Valle", price: 0.35, category: "Mampostería", rating: 4.5, stock: "Alto", deliveryTime: "24h", imgUrl: "https://images.unsplash.com/photo-1518709779341-56cf4535e94b?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 5, name: "Pintura Suprema Exterior Blanco (Caneca)", provider: "Pinturas Cóndor", price: 65.00, category: "Acabados", rating: 4.6, stock: "Alto", deliveryTime: "24h", imgUrl: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 6, name: "Porcelanato Carrara 60x60", provider: "Graiman", price: 18.50, category: "Acabados", rating: 4.9, stock: "Medio", deliveryTime: "48h", imgUrl: "https://images.unsplash.com/photo-1502005097973-f5425287eb1d?auto=format&fit=crop&q=80&w=400&h=300" },
  ]

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      
      {/* Smart Banner Header */}
      <div className="bg-brand-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">SARA Compras</h1>
            <p className="text-brand-sage text-lg">Marketplace B2B de Materiales de Construcción.</p>
            <p className="text-gray-400 max-w-xl mt-2 text-sm">Cotiza, compara y compra directamente a fábricas y distribuidores. Conectado a la logística de SARA Fletes.</p>
          </div>
          
          <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm max-w-md w-full">
            <div className="flex items-center gap-3 mb-2">
              <PackageCheck className="text-brand-sage" size={24} />
              <h3 className="font-bold text-lg">Recomendaciones APU</h3>
            </div>
            <p className="text-xs text-gray-300 mb-3">Según tu último presupuesto analizado, tienes materiales pendientes de cotizar.</p>
            <button className="w-full py-2 bg-brand-sage text-slate-900 font-bold rounded-lg text-sm hover:bg-white transition-colors">
              Ver Requisición Automática
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter size={18}/> Filtros</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categorías</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Obra Gris</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Acero y Metales</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Acabados</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Tuberías e Instalaciones</label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proveedores</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Holcim</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Adelca</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"/> Graiman</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, SKU o categoría..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-transparent"
              />
            </div>
            <button className="px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Carrito (0)</span>
            </button>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={product.imgUrl} alt={product.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-brand-dark">
                    {product.category}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-gray-700">{product.rating}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                    <Building2 size={14} /> {product.provider}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Precio sin IVA</p>
                        <p className="text-2xl font-black text-brand-sage">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 mb-0.5">{product.stock}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 justify-end"><Truck size={10}/> Envío {product.deliveryTime}</p>
                      </div>
                    </div>
                    
                    <button className="w-full py-2.5 border-2 border-brand-sage text-brand-sage font-bold rounded-xl hover:bg-brand-sage hover:text-white transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart size={18} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <PackageCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">No se encontraron productos</h3>
              <p className="text-gray-500 mt-2">Intenta buscar con otros términos o limpia los filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
