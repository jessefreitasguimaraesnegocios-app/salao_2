
import React, { useState, useEffect } from 'react';
import { api } from '../../services/supabaseApi';
import { Business, Transaction } from '../../types';
import { Users, Store, CreditCard, TrendingUp, Activity, DollarSign, PieChart } from 'lucide-react';
import { DashboardCard } from '../../components/DashboardCard';

export const AdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    Promise.all([
      api.getBusinesses(),
      api.getTransactions()
    ]).then(([b, t]) => {
      setBusinesses(b);
      setTransactions(t);
    });
  }, []);

  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalSplitFees = transactions.reduce((acc, t) => acc + t.admin_fee, 0);
  const totalSubscriptionRevenue = businesses
    .filter(b => b.status === 'ACTIVE')
    .reduce((acc, b) => acc + (b.monthly_fee || 0), 0);

  const totalPlatformRevenue = totalSplitFees + totalSubscriptionRevenue;

  return (
    <div className="p-8 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hub de Controle Global</h1>
        <p className="text-slate-500 font-medium mt-1">Visão financeira e operacional da sua infraestrutura SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl shadow-slate-200 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
             <DollarSign size={100} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Receita Total Hub</p>
          <h3 className="text-3xl font-black">R$ {totalPlatformRevenue.toFixed(2)}</h3>
          <p className="text-[10px] text-indigo-400 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> +18.4% este mês
          </p>
        </div>

        <DashboardCard 
          title="Parceiros Ativos" 
          value={businesses.filter(b => b.status === 'ACTIVE').length} 
          icon={<Store className="text-indigo-600" size={24} />}
        />
        
        <DashboardCard 
          title="Receita de Splits" 
          value={`R$ ${totalSplitFees.toFixed(2)}`} 
          icon={<PieChart className="text-indigo-600" size={24} />}
          trend={{ value: 12, isUp: true }}
        />

        <DashboardCard 
          title="Recorrência (Mensalidades)" 
          value={`R$ ${totalSubscriptionRevenue.toFixed(2)}`} 
          icon={<Activity className="text-indigo-600" size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900">Volume Transacional (GMV)</h3>
               <div className="flex gap-2">
                 <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500">Últimos 30 dias</span>
               </div>
             </div>
             
             <div className="flex items-end gap-2 h-48">
               {[40, 65, 45, 90, 75, 55, 80, 100, 85, 70, 95, 60].map((h, i) => (
                 <div key={i} className="flex-1 bg-indigo-50 rounded-t-xl relative group">
                   <div 
                    className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-xl transition-all duration-500" 
                    style={{ height: `${h}%` }}
                   />
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     R${(h * 150).toFixed(0)}
                   </div>
                 </div>
               ))}
             </div>
             <p className="text-center text-slate-400 text-xs font-bold mt-6">Crescimento constante de volume processado via split.</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-xl font-black text-slate-900 mb-6">Histórico de Splits</h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                      {tx.customer_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{tx.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transação #{tx.id.substr(0,5)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">+ R$ {tx.admin_fee.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Taxa Split</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
             <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-6">Marketplace Health</h4>
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                    <span>Performance Meta</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full">
                    <div className="h-full bg-white w-[82%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
                <div>
                   <div className="p-4 bg-white/10 rounded-2xl">
                     <p className="text-xs font-medium text-indigo-100">Dica Hub Admin:</p>
                     <p className="text-sm font-bold mt-1 leading-relaxed">Aumente sua receita de recorrência incentivando planos anuais para novos lojistas.</p>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h4 className="text-lg font-black text-slate-900 mb-6">Lojistas Pendentes</h4>
             <div className="space-y-4">
               {businesses.filter(b => b.status === 'PENDING').length > 0 ? (
                 businesses.filter(b => b.status === 'PENDING').map(b => (
                    <div key={b.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                          {b.name[0]}
                        </div>
                        <p className="text-sm font-bold text-slate-700">{b.name}</p>
                      </div>
                      <button className="text-xs font-black text-indigo-600 hover:underline">Analisar</button>
                    </div>
                 ))
               ) : (
                 <p className="text-center text-slate-400 py-4 text-sm font-medium italic">Nenhuma aprovação pendente.</p>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
