
import React, { useState, useEffect } from 'react';
import { api } from '../../services/supabaseApi';
import { Business, BusinessType } from '../../types';
import { 
  Store, 
  ShieldAlert, 
  ShieldCheck, 
  Settings2, 
  Power, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Save, 
  PieChart, 
  Calendar,
  AlertCircle,
  Scissors,
  ArrowRight
} from 'lucide-react';

export const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Business> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; partner: Business | null }>({ isOpen: false, partner: null });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await api.getBusinesses();
    setPartners(data);
  };

  const toggleStatus = async (partner: Business) => {
    const newStatus = partner.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api.updateBusiness(partner.id, { status: newStatus as any });
    load();
  };

  const handleDeleteClick = (partner: Business) => {
    setDeleteConfirm({ isOpen: true, partner });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.partner) {
      await api.deleteBusiness(deleteConfirm.partner.id);
      setDeleteConfirm({ isOpen: false, partner: null });
      load();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, partner: null });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    if (editingPartner.id) {
      await api.updateBusiness(editingPartner.id, editingPartner);
    } else {
      await api.addBusiness({
        name: editingPartner.name || '',
        type: editingPartner.type || BusinessType.BARBERSHOP,
        owner_id: 'auto-' + Math.random().toString(36).substr(2, 5),
        revenue_split: Number(editingPartner.revenue_split) || 10,
        monthly_fee: Number(editingPartner.monthly_fee) || 149.90,
        status: 'ACTIVE',
        description: editingPartner.description || '',
        mp_connected: false
      });
    }
    setIsModalOpen(false);
    load();
  };

  const filtered = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Parceiros</h1>
          <p className="text-slate-500 font-medium">Controle total sobre a economia e lojistas da plataforma.</p>
        </div>
        <button 
          onClick={() => { setEditingPartner({ revenue_split: 10, monthly_fee: 149.90, type: BusinessType.BARBERSHOP }); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black flex items-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
        >
          <Plus size={24} /> Novo Lojista
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou ID..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-10 py-5">Estabelecimento</th>
                <th className="px-6 py-5">Categoria</th>
                <th className="px-6 py-5">Taxa de Split</th>
                <th className="px-6 py-5">Assinatura Mensal</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-10 py-5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                        {p.name[0]}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 block text-base">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {p.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
                      {p.type === BusinessType.BARBERSHOP ? 'Barbearia' : 'Salão de Beleza'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <PieChart size={16} />
                      </div>
                      <span className="font-black text-slate-900">{p.revenue_split}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <Calendar size={16} />
                      </div>
                      <span className="font-black text-slate-900">R$ {p.monthly_fee?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      {p.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                          <ShieldCheck size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                          <ShieldAlert size={12} /> Suspenso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingPartner(p); setIsModalOpen(true); }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                        title="Ajustar Regras de Negócio"
                      >
                        <Settings2 size={20} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(p)}
                        className={`p-3 rounded-2xl transition-all border border-transparent shadow-sm ${p.status === 'ACTIVE' ? 'text-amber-400 hover:text-amber-600 hover:border-amber-100 hover:bg-white' : 'text-green-400 hover:text-green-600 hover:border-green-100 hover:bg-white'}`}
                        title={p.status === 'ACTIVE' ? 'Suspender Lojista' : 'Ativar Lojista'}
                      >
                        <Power size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                        title="Remover Permanentemente"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <Store className="mx-auto text-slate-100 mb-6" size={80} />
              <h3 className="text-2xl font-black text-slate-300">Nenhum parceiro encontrado</h3>
              <p className="text-slate-400 font-medium">Tente ajustar sua busca ou adicione um novo lojista.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Econômico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingPartner?.id ? 'Configurações Econômicas' : 'Novo Lojista SaaS'}</h3>
                <p className="text-slate-500 text-sm font-medium">Defina as regras financeiras deste contrato.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm hover:text-slate-900 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome do Estabelecimento</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold outline-none"
                    value={editingPartner?.name || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Taxa Split Hub (%)</label>
                    <div className="relative">
                      <PieChart className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input 
                        type="number" 
                        required
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-600"
                        value={editingPartner?.revenue_split}
                        onChange={(e) => setEditingPartner({...editingPartner, revenue_split: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Mensalidade (R$)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" size={18} />
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-green-600"
                        value={editingPartner?.monthly_fee}
                        onChange={(e) => setEditingPartner({...editingPartner, monthly_fee: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Categoria de Atuação</label>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setEditingPartner({...editingPartner, type: BusinessType.BARBERSHOP})}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${editingPartner?.type === BusinessType.BARBERSHOP ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      <Scissors size={16} /> Barbearia
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingPartner({...editingPartner, type: BusinessType.SALON})}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${editingPartner?.type === BusinessType.SALON ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      <Store size={16} /> Salão
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 text-amber-800">
                  <AlertCircle size={24} className="shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">Nota de Segurança</p>
                    <p className="text-sm font-medium leading-relaxed">As alterações na taxa de split afetam apenas novas transações. As mensalidades devem ser faturadas via seu gateway principal.</p>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <Save size={24} /> {editingPartner?.id ? 'Aplicar Novas Taxas' : 'Cadastrar e Ativar Parceiro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm.isOpen && deleteConfirm.partner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-red-50/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Confirmar Exclusão</h3>
                  <p className="text-slate-500 text-sm font-medium">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                <p className="text-sm font-bold text-red-900 mb-2">
                  Você está prestes a excluir permanentemente:
                </p>
                <p className="text-lg font-black text-slate-900 mb-4">
                  {deleteConfirm.partner.name}
                </p>
                <div className="space-y-2 text-xs font-medium text-red-700">
                  <p className="flex items-center gap-2">
                    <AlertCircle size={14} /> Todos os produtos serão removidos
                  </p>
                  <p className="flex items-center gap-2">
                    <AlertCircle size={14} /> Todos os serviços serão removidos
                  </p>
                  <p className="flex items-center gap-2">
                    <AlertCircle size={14} /> Todos os membros da equipe serão removidos
                  </p>
                  <p className="flex items-center gap-2">
                    <AlertCircle size={14} /> Histórico de transações será mantido para auditoria
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDeleteCancel}
                  className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Excluir Permanentemente
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
