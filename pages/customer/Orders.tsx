
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { Transaction } from '../../types';
import { ShoppingBag, Calendar, CheckCircle, Package } from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const txs = await api.getTransactions();
      // Em um cenário real, filtrariamos pelo user_id do cliente logado.
      setOrders(txs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    };
    fetch();
  }, []);

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Meus Pedidos</h1>
        <p className="text-slate-500">Acompanhe seu histórico de agendamentos e compras.</p>
      </div>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Package size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Pagamento Aprovado</h3>
                <p className="text-sm text-slate-400 font-medium mb-3">ID: #{order.id.toUpperCase()}</p>
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                    <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase">
                    <CheckCircle size={14} /> {order.payment_method}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
              <span className="text-sm text-slate-400 font-medium">Total Pago</span>
              <span className="text-2xl font-black text-slate-900">R$ {order.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <ShoppingBag className="mx-auto text-slate-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">Você ainda não fez nenhum pedido.</h3>
            <p className="text-slate-400 mt-2">Explore os estabelecimentos e encontre o que precisa!</p>
          </div>
        )}
      </div>
    </div>
  );
};
