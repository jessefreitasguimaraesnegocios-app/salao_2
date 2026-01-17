
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, ShieldCheck, User, Store, ArrowRight, Zap, Star, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';
import { api } from '../services/mockApi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    let email = '';
    if (role === UserRole.SUPER_ADMIN) email = 'admin@belezahub.com';
    if (role === UserRole.BUSINESS_OWNER) email = 'joao@barbearia.com';
    if (role === UserRole.CUSTOMER) email = 'cliente@exemplo.com';

    const user = await api.login(email, role);
    if (user) {
      if (role === UserRole.SUPER_ADMIN) navigate('/admin');
      else if (role === UserRole.BUSINESS_OWNER) navigate('/owner');
      else navigate('/explore');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Scissors className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">BelezaHub</span>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => handleLogin(UserRole.SUPER_ADMIN)}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck size={16} /> Admin Central
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
          <Zap size={16} /> O Futuro da Gestão de Estética
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Sua barbearia ou salão em <span className="text-indigo-600">outro nível.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          BelezaHub é a plataforma SaaS multi-tenant definitiva. Gestão completa, pagamentos integrados com split automático e experiência premium para seus clientes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Owner Entry */}
          <button 
            onClick={() => handleLogin(UserRole.BUSINESS_OWNER)}
            className="group p-8 rounded-3xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-left shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Store size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Sou Estabelecimento</h3>
            <p className="text-slate-400 text-sm mb-6">Gerencie sua equipe, agenda e vendas com inteligência.</p>
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              Entrar Agora <ArrowRight size={18} />
            </div>
          </button>

          {/* Customer Entry */}
          <button 
            onClick={() => handleLogin(UserRole.CUSTOMER)}
            className="group p-8 rounded-3xl bg-white border border-slate-200 text-slate-900 hover:border-indigo-300 transition-all text-left shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Sou Cliente</h3>
            <p className="text-slate-500 text-sm mb-6">Agende serviços e compre produtos dos melhores locais.</p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              Explorar Lojas <ArrowRight size={18} />
            </div>
          </button>

          {/* Feature Highlight */}
          <div className="p-8 rounded-3xl bg-indigo-600 text-white flex flex-col justify-center shadow-lg">
             <div className="flex mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="white" className="text-white" />)}
             </div>
             <p className="text-lg font-medium italic mb-4">"A melhor decisão que tomei para minha barbearia. Tudo organizado em um só lugar."</p>
             <p className="text-sm font-bold">— André, Vintage Cuts</p>
          </div>
        </div>
      </section>

      {/* Mini Features */}
      <section className="bg-white py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-indigo-600 mb-4" size={32} />
            <h4 className="font-bold text-slate-900">Multi-Tenant</h4>
            <p className="text-slate-500 text-sm">Dados 100% isolados e seguros para seu negócio.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-indigo-600 mb-4" size={32} />
            <h4 className="font-bold text-slate-900">Split de Pagamento</h4>
            <p className="text-slate-500 text-sm">Receba seu valor líquido direto no Mercado Pago.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-indigo-600 mb-4" size={32} />
            <h4 className="font-bold text-slate-900">Agendamentos</h4>
            <p className="text-slate-500 text-sm">Controle sua agenda e evite buracos no horário.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-indigo-600 mb-4" size={32} />
            <h4 className="font-bold text-slate-900">IA Integrada</h4>
            <p className="text-slate-500 text-sm">Receba dicas de crescimento personalizadas por IA.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>&copy; 2025 BelezaHub. Desenvolvido para transformar o mercado de estética.</p>
      </footer>
    </div>
  );
};
