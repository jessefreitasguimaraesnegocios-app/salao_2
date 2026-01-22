
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { createMercadoPagoPayment, updateTransactionWithPaymentId } from '../../services/mercadoPagoPayment';
import { Business, BusinessType, Product, Service, CartItem, TeamMember, UserProfile } from '../../types';
import { ShoppingCart, Clock, CheckCircle2, ChevronLeft, CreditCard, ArrowRight, Minus, Plus, X, User, Calendar, ChevronRight, Scissors, Wallet, QrCode, Loader2, Tag, Package, Sparkles, Gift } from 'lucide-react';

// Gerar horários disponíveis
const generateTimeSlots = (openTime: string, closeTime: string, duration: number): string[] => {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMin = openMin;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

// Gerar próximos 14 dias
const generateNextDays = (): { date: Date; dayName: string; dayNumber: number; monthName: string }[] => {
  const days = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      date,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      monthName: monthNames[date.getMonth()]
    });
  }
  
  return days;
};

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES');
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [cartAnimation, setCartAnimation] = useState(false);
  
  // Estados do modal de agendamento - Agora são 3 etapas
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedProfessional, setSelectedProfessional] = useState<TeamMember | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getBusinessById(id),
        api.getProducts(id),
        api.getServices(id),
        api.getTeamMembers(id),
        api.getCurrentUser()
      ]).then(([b, p, s, t, u]) => {
        setBusiness(b);
        setProducts(p);
        setServices(s);
        setTeamMembers(t);
        setCurrentUser(u);
      });
    }
  }, [id]);

  const openBookingModal = (service: Service) => {
    setShowBookingModal(true);
    setBookingStep(1); // Começa escolhendo o profissional
    setSelectedProfessional(null);
    setSelectedService(service); // Já vem com o serviço selecionado
    setSelectedDate(null);
    setSelectedTime(null);
    setPaymentMethod('pix');
    setBookingStatus('IDLE');
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingStep(1);
    setSelectedProfessional(null);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStatus('IDLE');
  };

  const handleConfirmBooking = async () => {
    if (!business || !selectedService || !selectedProfessional || !selectedDate || !selectedTime || !currentUser) return;
    
    setBookingStatus('PROCESSING');
    
    // Simula processamento do pagamento
    await new Promise(r => setTimeout(r, 2000));
    
    await api.saveAppointment({
      business_id: business.id,
      customer_name: currentUser.name,
      customer_phone: '(00) 00000-0000', // Poderia vir do perfil do usuário
      service_id: selectedService.id,
      service_name: `${selectedService.name} com ${selectedProfessional.name}`,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      status: 'CONFIRMED',
      price: selectedService.price
    });

    // Cria transação
    const adminFee = selectedService.price * (business.revenue_split / 100);
    await api.createTransaction({
      business_id: business.id,
      amount: selectedService.price,
      admin_fee: adminFee,
      partner_net: selectedService.price - adminFee,
      status: 'PAID',
      payment_method: paymentMethod,
      customer_name: currentUser.name
    });
    
    setBookingStatus('SUCCESS');
  };

  const availableDays = generateNextDays();
  const timeSlots = selectedService && business?.opening_hours 
    ? generateTimeSlots('09:00', '19:00', selectedService.duration)
    : [];

  const addToCart = (product: Product) => {
    // Efeito visual: marca o produto como recém-adicionado
    setRecentlyAdded(product.id);
    setCartAnimation(true);
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Remove o efeito após 1 segundo
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 1000);

    // Remove a animação do carrinho após 600ms
    setTimeout(() => {
      setCartAnimation(false);
    }, 600);
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
    if (!business || cart.length === 0 || !business.mp_connected) {
      alert('Este estabelecimento não está conectado ao Mercado Pago.');
      return;
    }
    
    setCheckoutStatus('PROCESSING');

    try {
      const user = await api.getCurrentUser();
      const customerName = user?.name || 'Cliente Visitante';
      const customerEmail = user?.email || 'cliente@exemplo.com';

      // 1. Criar transação no banco (status: PENDING)
      const transaction = await api.createTransaction({
        business_id: business.id,
        amount: cartTotal,
        admin_fee: cartTotal * (business.revenue_split / 100),
        partner_net: cartTotal - (cartTotal * (business.revenue_split / 100)),
        status: 'PENDING',
        payment_method: 'pix',
        customer_name: customerName
      });

      // 2. Preparar items para o pagamento
      const paymentItems = cart.map(item => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      // 3. Criar pagamento no Mercado Pago
      const payment = await createMercadoPagoPayment(business.id, {
        transactionId: transaction.id,
        amount: cartTotal,
        description: `Compra na ${business.name}`,
        customerEmail,
        customerName,
        paymentMethod: 'pix',
        items: paymentItems
      });

      // 4. Atualizar transação com o payment_id
      await updateTransactionWithPaymentId(transaction.id, payment.id);

      // 5. Se for PIX, mostrar QR Code ou redirecionar
      if (payment.point_of_interaction?.transaction_data?.qr_code) {
        // Aqui você pode mostrar o QR Code em um modal
        console.log('QR Code PIX:', payment.point_of_interaction.transaction_data.qr_code);
        // O webhook atualizará o status quando o pagamento for aprovado
      }

      setCheckoutStatus('SUCCESS');
      setCart([]);
      
      // Notificar que o pagamento foi criado
      alert('Pagamento criado! Aguarde a confirmação. Você receberá uma notificação quando for aprovado.');
    } catch (error) {
      console.error('Erro no checkout:', error);
      setCheckoutStatus('IDLE');
      alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  if (!business) return null;

  const isSalon = business.type === BusinessType.SALON;
  const accentColor = isSalon ? 'rose' : 'indigo';

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className={`relative h-64 overflow-hidden ${isSalon ? 'bg-rose-900' : 'bg-slate-900'}`}>
        <img 
          src={business.cover_image || `https://picsum.photos/seed/${business.id}/1200/400`} 
          className="w-full h-full object-cover opacity-50" 
          alt="Foto de fundo"
        />
        <div className={`absolute inset-0 ${isSalon ? 'bg-gradient-to-t from-rose-900 to-rose-900/50' : 'bg-gradient-to-t from-slate-900 to-transparent'}`} />
        <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 w-full max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20">
            <ChevronLeft size={24} />
          </button>
          {/* Badge de tipo */}
          <div className={`absolute top-8 right-8 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 ${
            isSalon 
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
              : 'bg-slate-800 text-white'
          }`}>
            {isSalon ? <Sparkles size={14} /> : <Scissors size={14} />}
            {isSalon ? 'Salão de Beleza' : 'Barbearia'}
          </div>
          <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl">
            <div className={`w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-2xl ${
              isSalon ? 'bg-gradient-to-br from-rose-500 to-pink-500' : 'bg-indigo-600'
            }`}>
              {isSalon ? <Sparkles size={32} /> : business.name[0]}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white mb-2">{business.name}</h1>
            <p className={`text-sm max-w-2xl ${isSalon ? 'text-rose-200' : 'text-slate-300'}`}>{business.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className={`flex border-b mb-8 ${isSalon ? 'border-rose-100' : 'border-slate-200'}`}>
            <button 
              onClick={() => setTab('SERVICES')}
              className={`px-8 py-4 font-bold text-sm transition-all relative ${
                tab === 'SERVICES' 
                  ? (isSalon ? 'text-rose-600' : 'text-indigo-600') 
                  : 'text-slate-500'
              }`}
            >
              Serviços
              {tab === 'SERVICES' && <div className={`absolute bottom-0 left-0 w-full h-1 rounded-t-full ${isSalon ? 'bg-rose-500' : 'bg-indigo-600'}`} />}
            </button>
            <button 
              onClick={() => setTab('PRODUCTS')}
              className={`px-8 py-4 font-bold text-sm transition-all relative ${
                tab === 'PRODUCTS' 
                  ? (isSalon ? 'text-rose-600' : 'text-indigo-600') 
                  : 'text-slate-500'
              }`}
            >
              Loja (Produtos)
              {tab === 'PRODUCTS' && <div className={`absolute bottom-0 left-0 w-full h-1 rounded-t-full ${isSalon ? 'bg-rose-500' : 'bg-indigo-600'}`} />}
            </button>
          </div>

          {tab === 'SERVICES' ? (
            <div className="grid grid-cols-1 gap-4">
              {services.map(s => (
                <div key={s.id} className={`bg-white p-6 rounded-3xl border flex items-center justify-between group transition-all shadow-sm ${
                  isSalon 
                    ? 'border-rose-100 hover:border-rose-300' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{s.name}</h3>
                    <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                      <span className="flex items-center gap-1"><Clock size={14} /> {s.duration} min</span>
                      <span>•</span>
                      <span className={`font-bold ${isSalon ? 'text-rose-500' : 'text-indigo-600'}`}>Agendamento Online</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 mb-2">R$ {s.price.toFixed(2)}</p>
                    <button 
                      onClick={() => openBookingModal(s)}
                      className={`px-6 py-2 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                        isSalon 
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtro de Categorias */}
              {(() => {
                const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
                const categoryIcons: { [key: string]: React.ReactNode } = {
                  'Todos': <Package size={16} />,
                  'Cabelo': <Sparkles size={16} />,
                  'Barba': <Scissors size={16} />,
                  'Acessórios': <Tag size={16} />,
                  'Kits': <Gift size={16} />
                };
                
                return (
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? (isSalon 
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200' 
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200')
                            : (isSalon 
                                ? 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300')
                        }`}
                      >
                        {categoryIcons[cat] || <Tag size={16} />}
                        {cat}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedCategory === cat 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {cat === 'Todos' 
                            ? products.length 
                            : products.filter(p => p.category === cat).length}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Lista de Produtos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products
                  .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
                  .map(p => (
                    <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all group ${
                      isSalon 
                        ? 'border-rose-100 hover:border-rose-300' 
                        : 'border-slate-200 hover:border-indigo-300'
                    } ${
                      recentlyAdded === p.id 
                        ? 'ring-4 ring-offset-2 ' + (isSalon ? 'ring-rose-300 border-rose-400' : 'ring-indigo-300 border-indigo-400') + ' scale-[1.02]'
                        : ''
                    }`}>
                      <div className="h-40 overflow-hidden bg-slate-100 relative">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {isSalon && (
                          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className={`absolute top-3 left-3 px-2.5 py-1 backdrop-blur-sm rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                          isSalon 
                            ? 'bg-rose-50/90 text-rose-600' 
                            : 'bg-white/90 text-slate-600'
                        }`}>
                          <Tag size={10} /> {p.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
                        <p className={`text-xs mb-3 ${isSalon ? 'text-rose-400' : 'text-slate-400'}`}>
                          {p.stock > 0 ? `${p.stock} em estoque` : 'Esgotado'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-lg text-slate-900">R$ {p.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(p)}
                            disabled={p.stock === 0}
                            className={`p-2.5 text-white rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative ${
                              isSalon 
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            } ${
                              recentlyAdded === p.id 
                                ? 'animate-bounce scale-110 ring-4 ring-offset-2 ring-offset-white ' + (isSalon ? 'ring-rose-300' : 'ring-indigo-300')
                                : ''
                            }`}
                          >
                            <ShoppingCart 
                              size={16} 
                              className={`transition-transform ${recentlyAdded === p.id ? 'scale-125 rotate-12' : ''}`}
                            />
                            {recentlyAdded === p.id && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Mensagem se não houver produtos na categoria */}
              {products.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory).length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Package size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Nenhum produto nesta categoria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className={`bg-white p-8 rounded-3xl border sticky top-8 shadow-xl ${
            isSalon ? 'border-rose-100' : 'border-slate-200'
          }`}>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingCart 
                size={24} 
                className={`transition-all ${isSalon ? 'text-rose-500' : 'text-indigo-600'} ${
                  cartAnimation ? 'animate-bounce scale-125' : ''
                }`}
              /> 
              Meu Carrinho
              {cart.length > 0 && (
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-black text-white ${
                  isSalon ? 'bg-rose-500' : 'bg-indigo-600'
                } ${cartAnimation ? 'animate-pulse scale-110' : ''}`}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </h3>
            
            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 no-scrollbar">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{item.product.name}</p>
                    <p className="text-slate-500 text-xs">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border ${
                    isSalon ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <button onClick={() => updateCartQuantity(item.product.id, -1)} className={`transition-colors ${isSalon ? 'text-rose-400 hover:text-rose-600' : 'text-slate-400 hover:text-indigo-600'}`}><Minus size={14} /></button>
                    <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, 1)} className={`transition-colors ${isSalon ? 'text-rose-400 hover:text-rose-600' : 'text-slate-400 hover:text-indigo-600'}`}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-slate-400 py-12 italic">Seu carrinho está vazio.</p>
              )}
            </div>

            <div className={`border-t pt-6 space-y-3 ${isSalon ? 'border-rose-100' : 'border-slate-100'}`}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl pt-2">
                <span className="font-black text-slate-900">Total</span>
                <span className={`font-black ${isSalon ? 'text-rose-500' : 'text-indigo-600'}`}>R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutStatus === 'PROCESSING'}
              className={`w-full mt-8 py-4 text-white rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                isSalon 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {checkoutStatus === 'PROCESSING' ? (
                <>Processando...</>
              ) : (
                <>Finalizar Compra <ArrowRight size={20} /></>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4">
              <CreditCard size={18} className={isSalon ? 'text-rose-200' : 'text-slate-300'} />
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

      {/* Modal de Agendamento - 3 Etapas */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {bookingStatus === 'SUCCESS' ? 'Agendamento Confirmado!' : 'Agendar Serviço'}
                </h2>
                {bookingStatus !== 'SUCCESS' && (
                  <p className="text-slate-500 text-sm">
                    {bookingStep === 1 && 'Escolha o profissional'}
                    {bookingStep === 2 && 'Escolha data e horário'}
                    {bookingStep === 3 && 'Pagamento'}
                  </p>
                )}
              </div>
              <button 
                onClick={closeBookingModal}
                className="p-3 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Serviço Selecionado - Sempre visível */}
            {bookingStatus !== 'SUCCESS' && selectedService && (
              <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <Scissors size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedService.name}</p>
                    <p className="text-xs text-slate-500">{selectedService.duration} min</p>
                  </div>
                </div>
                <p className="font-black text-indigo-600">R$ {selectedService.price.toFixed(2)}</p>
              </div>
            )}

            {/* Progresso - 3 etapas */}
            {bookingStatus !== 'SUCCESS' && (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        bookingStep >= step 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step === 1 && <User size={18} />}
                        {step === 2 && <Calendar size={18} />}
                        {step === 3 && <CreditCard size={18} />}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-1 rounded-full transition-all ${
                          bookingStep > step ? 'bg-indigo-600' : 'bg-slate-200'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Profissional</span>
                  <span>Data/Hora</span>
                  <span>Pagamento</span>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6">
              {bookingStatus === 'SUCCESS' ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600" size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Pagamento Confirmado!</h3>
                  <p className="text-slate-500 mb-6">
                    Seu agendamento foi realizado com sucesso.
                  </p>
                  <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cliente</span>
                      <span className="font-bold text-slate-900">{currentUser?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serviço</span>
                      <span className="font-bold text-slate-900">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Profissional</span>
                      <span className="font-bold text-slate-900">{selectedProfessional?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data</span>
                      <span className="font-bold text-slate-900">
                        {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Horário</span>
                      <span className="font-bold text-slate-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-slate-500">Valor Pago</span>
                      <span className="font-black text-green-600">R$ {selectedService?.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={closeBookingModal}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Step 1: Escolher Profissional */}
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-slate-600 mb-4">Selecione o profissional de sua preferência:</p>
                      {teamMembers.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <User size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Nenhum profissional cadastrado</p>
                        </div>
                      ) : (
                        teamMembers.filter(m => m.status === 'ACTIVE').map((member) => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setSelectedProfessional(member);
                              setBookingStep(2);
                            }}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left hover:border-indigo-300 hover:bg-indigo-50 ${
                              selectedProfessional?.id === member.id 
                                ? 'border-indigo-600 bg-indigo-50' 
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-16 h-16 rounded-2xl object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{member.name}</h4>
                              <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                              <p className="text-xs text-slate-500 mt-1">{member.specialties}</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-400" />
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Step 2: Escolher Data e Horário */}
                  {bookingStep === 2 && (
                    <div className="space-y-6">
                      {/* Profissional selecionado */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <img 
                          src={selectedProfessional?.avatar} 
                          alt={selectedProfessional?.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{selectedProfessional?.name}</p>
                          <p className="text-xs text-slate-500">{selectedProfessional?.role}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-600 mb-4 font-medium">Selecione a data:</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {availableDays.map((day, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedTime(null); // Reset time when date changes
                              }}
                              className={`flex-shrink-0 w-16 p-3 rounded-2xl border-2 transition-all text-center ${
                                selectedDate?.toDateString() === day.date.toDateString()
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-200 bg-white hover:border-indigo-300'
                              }`}
                            >
                              <p className={`text-[10px] font-bold uppercase ${
                                selectedDate?.toDateString() === day.date.toDateString() ? 'text-indigo-200' : 'text-slate-400'
                              }`}>{day.dayName}</p>
                              <p className="text-2xl font-black">{day.dayNumber}</p>
                              <p className={`text-[10px] font-medium ${
                                selectedDate?.toDateString() === day.date.toDateString() ? 'text-indigo-200' : 'text-slate-500'
                              }`}>{day.monthName}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedDate && (
                        <div>
                          <p className="text-slate-600 mb-4 font-medium">Selecione o horário:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => {
                                  setSelectedTime(time);
                                  // Avança automaticamente para o pagamento
                                  setTimeout(() => setBookingStep(3), 300);
                                }}
                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                  selectedTime === time
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Pagamento */}
                  {bookingStep === 3 && (
                    <div className="space-y-6">
                      {/* Resumo */}
                      <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Resumo do Agendamento</h4>
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedProfessional?.avatar} 
                            alt={selectedProfessional?.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{selectedProfessional?.name}</p>
                            <p className="text-xs text-slate-500">{selectedService?.name}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                          <span className="text-slate-500">
                            {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} às {selectedTime}
                          </span>
                          <span className="font-black text-indigo-600">R$ {selectedService?.price.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Cliente logado */}
                      <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-200">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                          {currentUser?.name?.[0] || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{currentUser?.name || 'Cliente'}</p>
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} /> Logado como cliente
                          </p>
                        </div>
                      </div>

                      {/* Forma de Pagamento */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4">Forma de Pagamento</h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => setPaymentMethod('pix')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                              paymentMethod === 'pix' 
                                ? 'border-indigo-600 bg-indigo-50' 
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              paymentMethod === 'pix' ? 'bg-indigo-600' : 'bg-slate-100'
                            }`}>
                              <QrCode size={24} className={paymentMethod === 'pix' ? 'text-white' : 'text-slate-500'} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-bold text-slate-900">PIX</p>
                              <p className="text-xs text-slate-500">Pagamento instantâneo</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === 'pix' 
                                ? 'border-indigo-600 bg-indigo-600' 
                                : 'border-slate-300'
                            }`}>
                              {paymentMethod === 'pix' && (
                                <CheckCircle2 size={16} className="text-white" />
                              )}
                            </div>
                          </button>

                          <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                              paymentMethod === 'credit_card' 
                                ? 'border-indigo-600 bg-indigo-50' 
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              paymentMethod === 'credit_card' ? 'bg-indigo-600' : 'bg-slate-100'
                            }`}>
                              <CreditCard size={24} className={paymentMethod === 'credit_card' ? 'text-white' : 'text-slate-500'} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-bold text-slate-900">Cartão de Crédito</p>
                              <p className="text-xs text-slate-500">Visa, Mastercard, Elo</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === 'credit_card' 
                                ? 'border-indigo-600 bg-indigo-600' 
                                : 'border-slate-300'
                            }`}>
                              {paymentMethod === 'credit_card' && (
                                <CheckCircle2 size={16} className="text-white" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total a pagar</p>
                          <p className="text-3xl font-black text-white">R$ {selectedService?.price.toFixed(2)}</p>
                        </div>
                        <Wallet size={32} className="text-indigo-400" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer com botões */}
            {bookingStatus !== 'SUCCESS' && (
              <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0">
                {bookingStep > 1 && bookingStatus !== 'PROCESSING' && (
                  <button
                    onClick={() => {
                      if (bookingStep === 3) {
                        setSelectedTime(null);
                      }
                      setBookingStep((prev) => (prev > 1 ? prev - 1 : prev) as 1 | 2 | 3);
                    }}
                    className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Voltar
                  </button>
                )}
                {bookingStep === 3 && (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingStatus === 'PROCESSING'}
                    className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                  >
                    {bookingStatus === 'PROCESSING' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} /> Pagar R$ {selectedService?.price.toFixed(2)}
                      </>
                    )}
                  </button>
                )}
                {/* Indicador de seleção para etapas 1 e 2 */}
                {bookingStep === 1 && (
                  <div className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl font-medium text-center text-sm">
                    Selecione um profissional para continuar
                  </div>
                )}
                {bookingStep === 2 && !selectedTime && (
                  <div className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl font-medium text-center text-sm">
                    {!selectedDate ? 'Selecione uma data' : 'Selecione um horário para continuar'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
