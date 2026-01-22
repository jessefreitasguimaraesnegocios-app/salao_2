
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Sparkles, 
  Loader2, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  ChevronRight,
  Scissors,
  CheckCircle
} from 'lucide-react';
import { DashboardCard } from '../../components/DashboardCard';
import { api } from '../../services/mockApi';
import { Transaction, Business, Appointment } from '../../types';
import { getBusinessAdvice } from '../../services/aiAssistant';
import { Link } from 'react-router-dom';

export const OwnerDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = await api.getCurrentUser();
      if (user?.business_id) {
        const [txs, b, appts] = await Promise.all([
          api.getTransactions(user.business_id),
          api.getBusinessById(user.business_id),
          api.getAppointments(user.business_id)
        ]);
        setTransactions(txs);
        setBusiness(b);
        setAppointments(appts);
      }
    };
    fetchData();
  }, []);

  const handleGetAdvice = async () => {
    if (!business) return;
    setIsAdviceLoading(true);
    const result = await getBusinessAdvice(
      business.name, 
      transactions.length, 
      "Proprietário de Estabelecimento de Beleza"
    );
    setAdvice(result);
    setIsAdviceLoading(false);
  };

  const totalRevenue = transactions.reduce((acc, t) => acc + t.partner_net, 0);
  const totalSales = transactions.length;
  
  // Próximos agendamentos (hoje, ordenados por hora)
  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => a.date === today && a.status === 'CONFIRMED')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  return (
    <div className="p-4 md:p-8 pb-24">
      {/* Header com Saudação e IA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Bom dia, {business?.name?.split(' ')[0] || 'Parceiro'}! 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">Aqui está o que está acontecendo no seu negócio hoje.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex -space-x-3 items-center mr-4">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-4 border-slate-50 shadow-sm" alt="Staff" />
            ))}
            <div className="w-10 h-10 rounded-full bg-slate-200 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">+2</div>
          </div>
          <button 
            onClick={handleGetAdvice}
            disabled={isAdviceLoading}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[20px] font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAdviceLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-indigo-400" />}
            Estratégia IA
          </button>
        </div>
      </div>

      {/* Seção de Advice IA Proativa */}
      {advice && (
        <div className="mb-10 p-8 bg-white border-2 border-indigo-50 rounded-[40px] shadow-2xl shadow-indigo-100/50 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Meu Salão App Insights</h3>
              <button onClick={() => setAdvice('')} className="ml-auto text-slate-300 hover:text-slate-500 transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-line italic">
              "{advice}"
            </p>
          </div>
        </div>
      )}

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1">Receita Líquida</p>
          <h3 className="text-3xl font-black mb-4">R$ {totalRevenue.toFixed(2)}</h3>
          <div className="flex items-center gap-2 text-xs font-black bg-white/20 w-fit px-3 py-1 rounded-full">
            <ArrowUpRight size={14} /> +12.5% este mês
          </div>
        </div>

        <DashboardCard 
          title="Vendas Realizadas" 
          value={totalSales} 
          icon={<ShoppingBag className="text-indigo-600" size={24} />}
          trend={{ value: 5.2, isUp: true }}
        />
        <DashboardCard 
          title="Próximos Agendamentos" 
          value={appointments.filter(a => a.date === today && a.status === 'CONFIRMED').length} 
          icon={<Calendar className="text-indigo-600" size={24} />}
        />
        <DashboardCard 
          title="Ticket Médio" 
          value={`R$ ${(totalSales ? totalRevenue / totalSales : 0).toFixed(2)}`} 
          icon={<CreditCard className="text-indigo-600" size={24} />}
        />
      </div>

      {/* Conteúdo Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Atalhos */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Atalhos de Ação Rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/owner/appointments" className="bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-600 hover:shadow-lg transition-all text-center group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Novo Agendamento</span>
            </Link>
            <Link to="/owner/products" className="bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-600 hover:shadow-lg transition-all text-center group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Registrar Venda</span>
            </Link>
            <Link to="/owner/services" className="bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-600 hover:shadow-lg transition-all text-center group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Scissors size={24} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Novo Serviço</span>
            </Link>
            <Link to="/owner/team" className="bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-600 hover:shadow-lg transition-all text-center group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Gerenciar Time</span>
            </Link>
          </div>
        </div>

        {/* Lado Direito: Próximos Atendimentos e Atividade */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Widget de Próximos Atendimentos */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Próximos Clientes</h3>
              <Link to="/owner/appointments" className="text-indigo-400 hover:text-indigo-300">
                <ChevronRight size={24} />
              </Link>
            </div>
            
            <div className="space-y-6">
              {upcoming.length > 0 ? upcoming.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-700 shrink-0">
                    <Clock size={14} className="text-indigo-400 mb-1" />
                    <span className="text-sm font-black">{appt.time}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm truncate">{appt.customer_name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{appt.service_name}</p>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-green-600 hover:text-white transition-all">
                    <CheckCircle size={18} />
                  </button>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-500">
                  <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase">Sem clientes pendentes</p>
                </div>
              )}
            </div>

            <button className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-500/20">
              Ver Agenda Completa
            </button>
          </div>

          {/* Transações Recentes (Compacto) */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Faturamento Recente</h3>
            <div className="space-y-5">
              {transactions.slice(0, 4).map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                      {tx.customer_name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{tx.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">+ R$ {tx.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm font-medium">Nenhuma venda hoje.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
