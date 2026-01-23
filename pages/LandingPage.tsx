
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, ShieldCheck, User, Store, ArrowRight, Zap } from 'lucide-react';
import { UserRole } from '../types';
// Removido: não usa mais mockApi

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    // Todos os usuários agora usam login com senha
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Scissors className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Meu Salão App</span>
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
          Meu Salão App é a plataforma SaaS multi-tenant definitiva. Gestão completa, pagamentos integrados com split automático e experiência premium para seus clientes.
        </p>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Customer Entry - Foco Principal */}
          <button 
            onClick={() => handleLogin(UserRole.CUSTOMER)}
            className="group w-full p-12 rounded-[48px] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-2 active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User size={40} />
              </div>
              <h3 className="text-4xl md:text-5xl font-black mb-4">Sou Cliente</h3>
              <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-md">
                Agende serviços e compre produtos dos melhores salões e barbearias.
              </p>
              <div className="flex items-center gap-3 text-white font-black text-lg px-8 py-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
                Explorar Lojas <ArrowRight size={24} />
              </div>
            </div>
          </button>
          
          {/* Link para Cadastro */}
          <div className="text-center">
            <p className="text-slate-600 mb-2">Não tem uma conta?</p>
            <button
              onClick={() => navigate('/signup?role=CUSTOMER')}
              className="text-indigo-600 hover:text-indigo-700 font-bold text-lg transition-colors"
            >
              Cadastre-se gratuitamente
            </button>
          </div>

          {/* Owner Entry - Pequeno e Discreto */}
          <button 
            onClick={() => handleLogin(UserRole.BUSINESS_OWNER)}
            className="group w-full p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-center border border-slate-200 hover:border-slate-300"
          >
            <div className="flex items-center justify-center gap-2">
              <Store size={18} />
              <span className="text-sm font-medium">Sou Estabelecimento</span>
            </div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>&copy; 2025 Meu Salão App. Desenvolvido para transformar o mercado de estética.</p>
      </footer>
    </div>
  );
};
