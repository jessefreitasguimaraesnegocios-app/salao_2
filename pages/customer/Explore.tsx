
import React, { useState, useEffect } from 'react';
import { api } from '../../services/supabaseApi';
import { Business, BusinessType } from '../../types';
import { Search, MapPin, Star, Scissors, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerExplore: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<'ALL' | BusinessType>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const b = await api.getBusinesses();
      setBusinesses(b.filter(x => x.status === 'ACTIVE'));
    };
    fetch();
  }, []);

  const filtered = businesses.filter(b => {
    const matchesFilter = filter === 'ALL' || b.type === filter;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Descubra o melhor para você</h1>
        <p className="text-slate-500">Encontre barbearias e salões premium perto de você.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome do estabelecimento..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${filter === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter(BusinessType.BARBERSHOP)}
            className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              filter === BusinessType.BARBERSHOP 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            <Scissors size={18} /> Barbearias
          </button>
          <button 
            onClick={() => setFilter(BusinessType.SALON)}
            className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              filter === BusinessType.SALON 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            <Sparkles size={18} /> Salões de Beleza
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(b => {
          const isSalon = b.type === BusinessType.SALON;
          
          return (
            <Link 
              to={`/store/${b.id}`} 
              key={b.id} 
              className={`group bg-white rounded-3xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                isSalon 
                  ? 'border-rose-100 hover:border-rose-300' 
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${b.id}/600/400`} 
                  alt={b.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay gradient para salões */}
                {isSalon && (
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <div className={`absolute top-4 right-4 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
                  isSalon 
                    ? 'bg-rose-50/90 text-rose-700' 
                    : 'bg-white/90 text-slate-900'
                }`}>
                  <Star size={12} fill="currentColor" className={isSalon ? 'text-rose-400' : 'text-amber-500'} /> 4.9 (120)
                </div>
                {/* Badge de tipo no canto superior esquerdo */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm ${
                  isSalon 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                    : 'bg-slate-900 text-white'
                }`}>
                  {isSalon ? <Sparkles size={12} /> : <Scissors size={12} />}
                  {isSalon ? 'Salão' : 'Barbearia'}
                </div>
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-black mb-2 ${
                  isSalon ? 'text-rose-900' : 'text-slate-900'
                }`}>{b.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{b.description}</p>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  isSalon ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  <MapPin size={14} /> {b.address}
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Nenhum estabelecimento encontrado</h3>
            <p className="text-slate-500">Tente ajustar seus filtros ou busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};
