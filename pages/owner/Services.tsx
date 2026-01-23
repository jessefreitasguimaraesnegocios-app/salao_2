
import React, { useState, useEffect } from 'react';
import { api } from '../../services/supabaseApi';
import { Service } from '../../types';
import { Plus, Clock, Edit2, Trash2, Scissors, X } from 'lucide-react';

export const OwnerServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const user = await api.getCurrentUser();
    if (user?.business_id) {
      const data = await api.getServices(user.business_id);
      setServices(data);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await api.getCurrentUser();
    if (user?.business_id && currentService) {
      await api.saveService({
        ...currentService,
        business_id: user.business_id,
        price: Number(currentService.price),
        duration: Number(currentService.duration),
        is_active: true
      } as any);
      setIsModalOpen(false);
      loadServices();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este serviço?')) {
      await api.deleteService(id);
      loadServices();
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Catálogo de Serviços</h1>
          <p className="text-slate-500">Defina os serviços e durações que seus clientes podem agendar.</p>
        </div>
        <button 
          onClick={() => { setCurrentService({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setCurrentService(s); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Scissors size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{s.name}</h3>
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                <Clock size={14} /> {s.duration} min
              </span>
              <span className="text-lg font-black text-indigo-600">
                R$ {s.price.toFixed(2)}
              </span>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-green-600">Disponível Online</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">{currentService?.id ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Corte Moderno + Lavagem"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={currentService?.name || ''}
                  onChange={(e) => setCurrentService({...currentService, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentService?.price || ''}
                    onChange={(e) => setCurrentService({...currentService, price: e.target.value as any})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Duração (minutos)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentService?.duration || ''}
                    onChange={(e) => setCurrentService({...currentService, duration: e.target.value as any})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
