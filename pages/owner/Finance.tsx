
import React, { useState, useEffect } from 'react';
import { api } from '../../services/supabaseApi';
import { Transaction, Business } from '../../types';
import { CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Filter, Download } from 'lucide-react';
import { DashboardCard } from '../../components/DashboardCard';

export const OwnerFinance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const user = await api.getCurrentUser();
      if (user?.business_id) {
        const [txs, b] = await Promise.all([
          api.getTransactions(user.business_id),
          api.getBusinessById(user.business_id)
        ]);
        setTransactions(txs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setBusiness(b);
      }
    };
    fetch();
  }, []);

  const totalGross = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalFees = transactions.reduce((acc, t) => acc + t.admin_fee, 0);
  const totalNet = transactions.reduce((acc, t) => acc + t.partner_net, 0);

  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Extrato Financeiro</h1>
          <p className="text-slate-500">Acompanhe suas vendas e valores a receber.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={18} /> Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800">
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard 
          title="Saldo Líquido" 
          value={`R$ ${totalNet.toFixed(2)}`} 
          icon={<Wallet className="text-green-600" size={24} />}
          colorClass="bg-white"
        />
        <DashboardCard 
          title="Total Bruto" 
          value={`R$ ${totalGross.toFixed(2)}`} 
          icon={<ArrowUpRight className="text-indigo-600" size={24} />}
        />
        <DashboardCard 
          title="Taxas Plataforma" 
          value={`R$ ${totalFees.toFixed(2)}`} 
          icon={<ArrowDownLeft className="text-red-500" size={24} />}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-900">Histórico de Transações</h3>
          <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">Atualizado agora</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor Bruto</th>
                <th className="px-6 py-4 text-right">Taxa (Split)</th>
                <th className="px-6 py-4 text-right">Valor Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{t.customer_name}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600 uppercase">Recebido</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-400 font-medium">R$ {t.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-red-400 font-medium">- R$ {t.admin_fee.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">R$ {t.partner_net.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
