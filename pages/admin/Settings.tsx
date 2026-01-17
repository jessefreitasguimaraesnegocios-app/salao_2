
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Zap, 
  ShieldAlert, 
  DollarSign, 
  Globe, 
  Bell, 
  Save, 
  Info,
  RefreshCw,
  Lock,
  Mail,
  PieChart
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações do Hub</h1>
          <p className="text-slate-500 font-medium">Parâmetros globais do SaaS e segurança da infraestrutura.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
          Salvar Regras
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Seção Financeira */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-[100px] -z-0 translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <PieChart size={24} className="text-indigo-600" /> Políticas de Faturamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Split de Transação Padrão (%)</label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                   <input 
                    type="number" 
                    defaultValue={10}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-2xl text-slate-900"
                   />
                </div>
                <p className="mt-3 text-xs text-slate-400 font-medium flex items-center gap-1.5 italic"><Info size={14} /> Aplicado automaticamente a novos lojistas.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Taxa de Saque Antecipado (%)</label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                   <input 
                    type="number" 
                    defaultValue={2.5}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-2xl text-slate-900"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Segurança & Infra */}
        <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-0" />
          
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
            <ShieldAlert size={24} className="text-red-400" /> Infraestrutura Crítica
          </h3>

          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
              <div>
                <h4 className="font-bold text-lg">Modo de Manutenção Global</h4>
                <p className="text-slate-400 text-sm">Bloqueia o acesso de todos os lojistas e clientes temporariamente.</p>
              </div>
              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${maintenanceMode ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">API Key de Produção (Logística)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="password" value="************************" readOnly className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 outline-none" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">E-mail de Suporte do Hub</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="email" defaultValue="suporte@belezahub.com" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 outline-none" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Branding & Experiência */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Globe size={24} className="text-indigo-600" /> Personalização de Marca
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome Comercial do SaaS</label>
              <input type="text" defaultValue="BelezaHub - Gestão Pro" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold" />
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4 text-indigo-700">
               <Zap size={24} className="shrink-0" />
               <p className="text-xs font-black uppercase leading-relaxed tracking-wider">A marca do hub é exibida no rodapé de todos os subdomínios dos lojistas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
