/**
 * Componente de Login com Senha
 * 
 * Permite que estabelecimentos e admins façam login usando email e senha
 * Usa Supabase Auth com autenticação tradicional
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle, AlertCircle, Store, ShieldCheck } from 'lucide-react';
import { getSupabaseClient } from '../../services/supabaseClient';
import { getUserProfile } from '../../services/authService';
import { UserRole } from '../../types';

export const PasswordLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determinar role: query param > BUSINESS_OWNER (padrão)
  const role = (searchParams.get('role') as UserRole) || UserRole.BUSINESS_OWNER;
  
  // Estado do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Handler para login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar input
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Fazer login com email e senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Email ou senha incorretos. Tente novamente.' 
        });
        return;
      }
      
      if (data.session) {
        // Buscar perfil do usuário
        const profile = await getUserProfile();
        
        if (profile) {
          // Verificar se o role do perfil corresponde ao esperado
          if (profile.role !== role) {
            await supabase.auth.signOut();
            setMessage({ 
              type: 'error', 
              text: `Este login é apenas para ${role === UserRole.BUSINESS_OWNER ? 'estabelecimentos' : 'administradores'}.` 
            });
            return;
          }
          
          setMessage({ type: 'success', text: 'Login realizado com sucesso! Redirecionando...' });
          
          // Aguardar um pouco antes de redirecionar
          setTimeout(() => {
            if (role === UserRole.SUPER_ADMIN) {
              navigate('/admin');
            } else {
              navigate('/owner');
            }
            window.location.reload(); // Recarregar para atualizar estado de autenticação
          }, 1500);
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Perfil não encontrado. Entre em contato com o suporte.' 
          });
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
      console.error('Erro ao fazer login:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-10 border border-slate-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {role === UserRole.SUPER_ADMIN && (
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="text-red-600" size={24} />
                </div>
              )}
              {role === UserRole.BUSINESS_OWNER && (
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Store className="text-indigo-600" size={24} />
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              {role === UserRole.SUPER_ADMIN && 'Acesso Admin'}
              {role === UserRole.BUSINESS_OWNER && 'Acesso Estabelecimento'}
            </h1>
            <p className="text-slate-500 font-medium">
              Digite seu email e senha para acessar
            </p>
          </div>
          
          {/* Mensagens de Feedback */}
          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} className="shrink-0" />
              ) : (
                <AlertCircle size={20} className="shrink-0" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
          
          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage(null);
                  }}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              ← Voltar para página inicial
            </button>
          </div>
        </div>
        
        {/* Informações de Segurança */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            🔒 Seus dados estão seguros. Use uma senha forte.
          </p>
        </div>
      </div>
    </div>
  );
};
