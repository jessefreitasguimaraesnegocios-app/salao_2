
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/supabaseApi';
import { Transaction } from '../../types';
import { ShoppingBag, Calendar, CheckCircle, Package, Store, CreditCard, QrCode } from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = await api.getCurrentUser();
      if (!currentUser) return;

      const txs = await api.getTransactions();
      // Filtra apenas transações do cliente logado (compras de produtos)
      // Em um cenário real, haveria um campo order_type ou similar
      const customerOrders = txs
        .filter(tx => tx.customer_name === currentUser.name)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setOrders(customerOrders);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Meus Pedidos</h1>
        <p className="text-slate-500">Histórico de compras de produtos nas lojas.</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Package size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      {order.status === 'PAID' ? 'Pago' : order.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Compra de Produtos</h3>
                  <p className="text-xs text-slate-400 font-medium mb-3">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                      {order.payment_method === 'pix' ? (
                        <><QrCode size={12} /> PIX</>
                      ) : (
                        <><CreditCard size={12} /> Cartão</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <span className="text-sm text-slate-400 font-medium">Total</span>
                <span className="text-2xl font-black text-green-600">R$ {order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <ShoppingBag className="mx-auto text-slate-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">Você ainda não comprou nenhum produto.</h3>
            <p className="text-slate-400 mt-2">Explore as lojas e encontre produtos incríveis!</p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Explorar Lojas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
