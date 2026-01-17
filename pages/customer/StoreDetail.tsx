
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { Business, Product, Service, CartItem } from '../../types';
import { ShoppingCart, Clock, CheckCircle2, ChevronLeft, CreditCard, ArrowRight, Minus, Plus } from 'lucide-react';

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES');
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getBusinessById(id),
        api.getProducts(id),
        api.getServices(id)
      ]).then(([b, p, s]) => {
        setBusiness(b);
        setProducts(p);
        setServices(s);
      });
    }
  }, [id]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!business || cart.length === 0) return;
    setCheckoutStatus('PROCESSING');
    
    // Simulate payment process
    await new Promise(r => setTimeout(r, 2000));

    const user = await api.getCurrentUser();
    const adminFee = cartTotal * (business.revenue_split / 100);
    
    await api.createTransaction({
      business_id: business.id,
      amount: cartTotal,
      admin_fee: adminFee,
      partner_net: cartTotal - adminFee,
      status: 'PAID',
      payment_method: 'pix',
      customer_name: user?.name || 'Cliente Visitante'
    });

    setCheckoutStatus('SUCCESS');
    setCart([]);
  };

  if (!business) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        <img src={`https://picsum.photos/seed/${business.id}/1200/400`} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 w-full max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20">
            <ChevronLeft size={24} />
          </button>
          <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl">
            <div className="w-full h-full rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl">
              {business.name[0]}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white mb-2">{business.name}</h1>
            <p className="text-slate-300 text-sm max-w-2xl">{business.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-8">
            <button 
              onClick={() => setTab('SERVICES')}
              className={`px-8 py-4 font-bold text-sm transition-all relative ${tab === 'SERVICES' ? 'text-indigo-600' : 'text-slate-500'}`}
            >
              Serviços
              {tab === 'SERVICES' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setTab('PRODUCTS')}
              className={`px-8 py-4 font-bold text-sm transition-all relative ${tab === 'PRODUCTS' ? 'text-indigo-600' : 'text-slate-500'}`}
            >
              Loja (Produtos)
              {tab === 'PRODUCTS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>

          {tab === 'SERVICES' ? (
            <div className="grid grid-cols-1 gap-4">
              {services.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-all shadow-sm">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{s.name}</h3>
                    <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                      <span className="flex items-center gap-1"><Clock size={14} /> {s.duration} min</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600">Agendamento Online</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 mb-2">R$ {s.price.toFixed(2)}</p>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-md">
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all shadow-sm">
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img src={p.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
                    <p className="text-slate-500 text-xs mb-4">Estoque: {p.stock} unidades</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">R$ {p.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addToCart(p)}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-md"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 sticky top-8 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingCart size={24} className="text-indigo-600" /> Meu Carrinho
            </h3>
            
            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 no-scrollbar">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{item.product.name}</p>
                    <p className="text-slate-500 text-xs">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <button onClick={() => updateCartQuantity(item.product.id, -1)} className="text-slate-400 hover:text-indigo-600 transition-colors"><Minus size={14} /></button>
                    <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, 1)} className="text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-slate-400 py-12 italic">Seu carrinho está vazio.</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl pt-2">
                <span className="font-black text-slate-900">Total</span>
                <span className="font-black text-indigo-600">R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutStatus === 'PROCESSING'}
              className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {checkoutStatus === 'PROCESSING' ? (
                <>Processando...</>
              ) : (
                <>Finalizar Compra <ArrowRight size={20} /></>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4">
              <CreditCard size={18} className="text-slate-300" />
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-green-500" /> Pagamento Seguro via Mercado Pago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {checkoutStatus === 'SUCCESS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Pagamento Realizado!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Sua compra foi processada com sucesso. Você receberá uma notificação em breve.
            </p>
            <button 
              onClick={() => setCheckoutStatus('IDLE')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
