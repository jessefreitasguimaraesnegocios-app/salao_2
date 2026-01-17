
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/mockApi';
import { Business, OpeningHour, BusinessType, NotificationSettings } from '../../types';
import { 
  Store, 
  MapPin, 
  Clock, 
  CreditCard, 
  Save, 
  Upload, 
  Camera, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Globe,
  Bell,
  Lock,
  Smartphone,
  Mail,
  Zap,
  ShieldAlert,
  LogOut,
  Eye,
  EyeOff,
  MessageSquare,
  ExternalLink,
  Info
} from 'lucide-react';

export const OwnerSettings: React.FC = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'payments' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingMP, setIsConnectingMP] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Camera & Image handling
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    const user = await api.getCurrentUser();
    if (user?.business_id) {
      const data = await api.getBusinessById(user.business_id);
      const businessWithDefaults = {
        ...data,
        notifications: data?.notifications || {
          email_appointments: true,
          email_marketing: false,
          whatsapp_reminders: true,
          low_stock_alerts: true,
          weekly_reports: true
        }
      } as Business;
      setBusiness(businessWithDefaults);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    
    setIsSaving(true);
    await api.updateBusiness(business.id, business);
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConnectMP = async () => {
    if (!business) return;
    setIsConnectingMP(true);
    
    // Simulando o fluxo de OAuth do Mercado Pago
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const updatedBusiness = {
      ...business,
      mp_connected: true
    };
    
    await api.updateBusiness(business.id, updatedBusiness);
    setBusiness(updatedBusiness);
    setIsConnectingMP(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    if (!business || !business.notifications) return;
    setBusiness({
      ...business,
      notifications: {
        ...business.notifications,
        [key]: !business.notifications[key]
      }
    });
  };

  const handleOpeningHoursChange = (index: number, field: keyof OpeningHour, value: any) => {
    if (!business) return;
    const newHours = [...(business.opening_hours || [])];
    newHours[index] = { ...newHours[index], [field]: value };
    setBusiness({ ...business, opening_hours: newHours });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusiness(prev => prev ? { ...prev, logo: reader.result as string } : null);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setIsCameraActive(false);
    }
  };

  const captureLogo = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setBusiness(prev => prev ? { ...prev, logo: imageData } : null);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  if (!business) return null;

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações</h1>
          <p className="text-slate-500 font-medium">Customize seu espaço digital e regras de negócio.</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold animate-in fade-in slide-in-from-right-4">
            <Check size={18} /> Alterações aplicadas!
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            <button 
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Store size={18} /> Perfil da Loja
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('hours')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'hours' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Clock size={18} /> Horários
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <CreditCard size={18} /> Pagamentos
            </button>
            <div className="border-t border-slate-100 my-2 hidden lg:block" />
            <button 
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Bell size={18} /> Notificações
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Lock size={18} /> Segurança
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleUpdate} className="space-y-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <Globe size={20} className="text-indigo-600" /> Identidade & Perfil
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="relative shrink-0">
                      <div className="w-40 h-40 rounded-[48px] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl relative">
                        {isCameraActive ? (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        ) : (
                          <img src={business.logo || `https://ui-avatars.com/api/?name=${business.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="Logo" />
                        )}
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-indigo-600 shadow-lg"><Upload size={18} /></button>
                          <button type="button" onClick={startCamera} className="p-2 bg-white rounded-full text-indigo-600 shadow-lg"><Camera size={18} /></button>
                        </div>
                      </div>
                      
                      {isCameraActive && (
                        <button type="button" onClick={captureLogo} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white p-4 rounded-full shadow-xl animate-pulse">
                          <Check size={24} />
                        </button>
                      )}
                      
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <canvas ref={canvasRef} className="hidden" />
                      <p className="mt-6 text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">Logo do Estabelecimento</p>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome do Negócio</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                          value={business.name}
                          onChange={(e) => setBusiness({...business, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Categoria</label>
                        <select 
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none bg-white font-bold text-slate-700"
                          value={business.type}
                          onChange={(e) => setBusiness({...business, type: e.target.value as BusinessType})}
                        >
                          <option value={BusinessType.BARBERSHOP}>Barbearia Clássica</option>
                          <option value={BusinessType.SALON}>Salão de Beleza / Estética</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Descrição Pública</label>
                      <textarea 
                        rows={4}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none font-medium text-slate-600 leading-relaxed"
                        placeholder="Conte um pouco sobre seu estabelecimento para seus clientes..."
                        value={business.description}
                        onChange={(e) => setBusiness({...business, description: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Endereço Completo</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                        <input 
                          type="text" 
                          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
                          placeholder="Rua, Número, Bairro, Cidade - UF"
                          value={business.address || ''}
                          onChange={(e) => setBusiness({...business, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Clock size={20} className="text-indigo-600" /> Horários de Atendimento
                    </h3>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário de Brasília</div>
                  </div>

                  <div className="space-y-4">
                    {business.opening_hours?.map((hour, index) => (
                      <div key={hour.day} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${hour.is_closed ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 w-1/3">
                          <div className={`w-3 h-3 rounded-full ${hour.is_closed ? 'bg-slate-300' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                          <span className="font-black text-slate-700">{hour.day}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-1 justify-center">
                          <input 
                            type="time" 
                            disabled={hour.is_closed}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-30"
                            value={hour.open}
                            onChange={(e) => handleOpeningHoursChange(index, 'open', e.target.value)}
                          />
                          <span className="text-slate-400 font-bold">às</span>
                          <input 
                            type="time" 
                            disabled={hour.is_closed}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-30"
                            value={hour.close}
                            onChange={(e) => handleOpeningHoursChange(index, 'close', e.target.value)}
                          />
                        </div>

                        <div className="w-1/4 flex justify-end">
                          <button 
                            type="button"
                            onClick={() => handleOpeningHoursChange(index, 'is_closed', !hour.is_closed)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hour.is_closed ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          >
                            {hour.is_closed ? 'Fechado' : 'Aberto'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 translate-x-10 -translate-y-10" />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                      <CreditCard size={20} className="text-indigo-600" /> Split & Recebimentos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Taxa da Plataforma</p>
                        <p className="text-3xl font-black text-indigo-700">{business.revenue_split}%</p>
                        <p className="text-xs text-indigo-500/70 mt-2">Comissão automática do marketplace.</p>
                      </div>
                      
                      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status da Conta</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${business.mp_connected ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'}`} />
                          <p className="text-lg font-bold">{business.mp_connected ? 'Pronto para Vender' : 'Aguardando Conexão'}</p>
                        </div>
                        {business.mp_connected && <p className="text-[10px] text-slate-400 mt-2 font-mono">ID: MP_MERCHANT_{business.id.toUpperCase()}</p>}
                      </div>
                    </div>

                    {!business.mp_connected ? (
                      <div className="p-10 border-2 border-dashed border-slate-100 rounded-[48px] text-center bg-slate-50/30">
                        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
                          <CreditCard size={32} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-3">Conectar ao Mercado Pago</h4>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                          Para habilitar o split automático e receber suas vendas de forma segura, conecte sua conta profissional do Mercado Pago.
                        </p>
                        
                        <button 
                          type="button"
                          onClick={handleConnectMP}
                          disabled={isConnectingMP}
                          className="flex items-center gap-3 px-12 py-5 bg-[#009EE3] text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-[#0081BC] transition-all mx-auto active:scale-95 disabled:opacity-50"
                        >
                          {isConnectingMP ? <RefreshCw size={24} className="animate-spin" /> : <><ExternalLink size={24} /> Conectar Agora</>}
                        </button>
                        
                        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Criptografado</span>
                          </div>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-1.5">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Split Imediato</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-green-50/50 rounded-[40px] border border-green-100">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                            <ShieldCheck size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-green-900">Integração Ativa</h4>
                            <p className="text-green-700 text-sm font-medium mt-1">
                              Sua conta está homologada para o split de pagamentos. Os valores líquidos das vendas de produtos e agendamentos cairão automaticamente na sua conta vinculada.
                            </p>
                            <div className="mt-6 flex gap-3">
                              <button 
                                type="button"
                                onClick={() => setBusiness({...business, mp_connected: false})}
                                className="px-5 py-2.5 bg-white border border-green-200 text-green-700 rounded-xl font-black text-xs hover:bg-green-100 transition-all flex items-center gap-2"
                              >
                                <RefreshCw size={14} /> Alterar Conta
                              </button>
                              <button type="button" className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition-all flex items-center gap-2">
                                <Info size={14} /> Ver Extrato MP
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Bell size={20} className="text-indigo-600" /> Preferências de Notificação
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* E-mail Notifications */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                          <Mail size={20} />
                        </div>
                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">E-mail</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-700">Novos Agendamentos</p>
                            <p className="text-[10px] text-slate-400 font-medium">Receba um alerta a cada nova reserva.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => toggleNotification('email_appointments')}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${business.notifications?.email_appointments ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${business.notifications?.email_appointments ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-700">Relatórios Semanais</p>
                            <p className="text-[10px] text-slate-400 font-medium">Resumo do faturamento e performance.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => toggleNotification('weekly_reports')}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${business.notifications?.weekly_reports ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${business.notifications?.weekly_reports ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* App & WhatsApp */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-green-600">
                          <MessageSquare size={20} />
                        </div>
                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Canais Diretos</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-700">Lembretes WhatsApp</p>
                            <p className="text-[10px] text-slate-400 font-medium">Avisar clientes automaticamente.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => toggleNotification('whatsapp_reminders')}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${business.notifications?.whatsapp_reminders ? 'bg-green-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${business.notifications?.whatsapp_reminders ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-700">Alertas de Estoque</p>
                            <p className="text-[10px] text-slate-400 font-medium">Aviso quando produtos estiverem acabando.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => toggleNotification('low_stock_alerts')}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${business.notifications?.low_stock_alerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${business.notifications?.low_stock_alerts ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <Lock size={20} className="text-indigo-600" /> Segurança da Conta
                  </h3>

                  <div className="space-y-8">
                    {/* Password Change */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Alterar Senha</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Nova Senha"
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Confirmar Senha"
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <Smartphone size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">Autenticação em 2 Etapas</p>
                            <p className="text-xs text-slate-500">Adicione uma camada extra de segurança.</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="px-6 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Sessões Ativas</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <Globe size={18} className="text-slate-400" />
                            <div>
                              <p className="text-sm font-bold text-slate-700">Chrome no MacOS</p>
                              <p className="text-[10px] text-green-500 font-black uppercase">Sessão Atual</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">São Paulo, BR</span>
                        </div>
                        
                        <button 
                          type="button"
                          className="w-full py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={16} /> Encerrar todas as outras sessões
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="fixed bottom-8 right-8 md:relative md:bottom-0 md:right-0">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
                Salvar Todas as Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
