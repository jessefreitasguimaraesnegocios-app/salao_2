
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { Transaction, Business } from '../../types';
import { 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  Search,
  Activity,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

type ViewMode = 'SPLITS' | 'SUBSCRIPTIONS';

export const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('SPLITS');

  useEffect(() => {
    Promise.all([
      api.getTransactions(),
      api.getBusinesses()
    ]).then(([txs, b]) => {
      setTransactions(txs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setBusinesses(b);
    });
  }, []);

  const totalPlatformVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalAdminSplitProfit = transactions.reduce((acc, t) => acc + t.admin_fee, 0);
  const totalMonthlyFees = businesses
    .filter(b => b.status === 'ACTIVE')
    .reduce((acc, b) => acc + (b.monthly_fee || 0), 0);

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.name || 'Negócio Desconhecido';

  const filteredSplits = transactions.filter(t => 
    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBusinessName(t.business_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = businesses.filter(b => 
    b.status === 'ACTIVE' && b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financeiro Consolidado</h1>
          <p className="text-slate-500 font-medium">Controle de faturamento, splits e assinaturas SaaS.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('SPLITS')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'SPLITS' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Splits
            </button>
            <button 
              onClick={() => setViewMode('SUBSCRIPTIONS')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'SUBSCRIPTIONS' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mensalidades
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
             <Activity size={120} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Volume Global (GMV)</p>
          <h3 className="text-4xl font-black">R$ {totalPlatformVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-indigo-400 font-bold mt-3 flex items-center gap-1">
            <TrendingUp size={12} /> Total transacionado na infra
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lucro Hub (Splits + Recorrência)</p>
          <h3 className="text-4xl font-black text-indigo-600">
            R$ {(totalAdminSplitProfit + totalMonthlyFees).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest">
              SPLITS: R$ {totalAdminSplitProfit.toFixed(2)}
            </div>
            <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-widest">
              SAAS: R$ {totalMonthlyFees.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Taxa de Conversão Hub</p>
          <h3 className="text-4xl font-black text-slate-900">
            {((totalAdminSplitProfit / (totalPlatformVolume || 1)) * 100).toFixed(1)}%
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-tighter">Eficiência média das taxas de split</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={viewMode === 'SPLITS' ? "Buscar cliente ou estabelecimento..." : "Buscar salão / barbearia..."}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
            <Filter size={14} /> Filtro Ativo: {viewMode === 'SPLITS' ? 'Transações' : 'Assinaturas'}
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'SPLITS' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-10 py-5">Data & Hora</th>
                  <th className="px-6 py-5">Estabelecimento</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-right">Venda Bruta</th>
                  <th className="px-6 py-5 text-right">Sua Comissão</th>
                  <th className="px-10 py-5 text-right">Repasse Parceiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSplits.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-10 py-6 text-sm font-medium text-slate-500">
                      {new Date(t.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-6">
                      <span className="font-black text-slate-900 text-sm">{getBusinessName(t.business_id)}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">{t.customer_name[0]}</div>
                         <span className="text-sm font-bold text-slate-600">{t.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-bold text-slate-400 text-sm">R$ {t.amount.toFixed(2)}</td>
                    <td className="px-6 py-6 text-right">
                      <span className="font-black text-indigo-600 text-sm">+ R$ {t.admin_fee.toFixed(2)}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="font-black text-slate-900 text-sm">R$ {t.partner_net.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-10 py-5">Parceiro</th>
                  <th className="px-6 py-5">Plano SaaS</th>
                  <th className="px-6 py-5">Valor Mensal</th>
                  <th className="px-6 py-5">Próximo Vencimento</th>
                  <th className="px-10 py-5 text-right">Status Assinatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                          {b.name[0]}
                        </div>
                        <span className="font-black text-slate-900 text-sm">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase">Professional SaaS</span>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-900 text-sm">
                      R$ {b.monthly_fee?.toFixed(2)}
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-slate-500">
                      Dia 10 / Mensal
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-green-600 text-xs font-black uppercase">
                        <CheckCircle2 size={14} /> Ativa e Adimplente
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {(viewMode === 'SPLITS' ? filteredSplits : filteredSubscriptions).length === 0 && (
            <div className="py-32 text-center">
              <Clock className="mx-auto text-slate-100 mb-6" size={80} />
              <h3 className="text-2xl font-black text-slate-300">Nenhum registro encontrado</h3>
              <p className="text-slate-400 font-medium">Não há movimentações financeiras para exibir com esses filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
