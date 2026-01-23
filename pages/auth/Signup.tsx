/**
 * Componente de Cadastro (Signup)
 * 
 * Permite que todos os tipos de usuário se cadastrem
 * usando email e senha com Supabase Auth
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, ArrowLeft, CheckCircle, AlertCircle, Store, ShieldCheck, User } from 'lucide-react';
import { getSupabaseClient } from '../../services/supabaseClient';
import { getUserProfile } from '../../services/authService';
import { UserRole } from '../../types';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determinar role: query param > CUSTOMER (padrão)
  const role = (searchParams.get('role') as UserRole) || UserRole.CUSTOMER;
  
  // Estado do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Handler para cadastro
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar input
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Fazer signup com email e senha
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: role,
            name: name.trim()
          }
        }
      });
      
      if (error) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Erro ao criar conta. Tente novamente.' 
        });
        return;
      }
      
      if (data.user) {
        // O trigger SQL criará o perfil automaticamente
        // Mas vamos verificar se foi criado
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar trigger
        
        const profile = await getUserProfile();
        
        if (profile) {
          setMessage({ 
            type: 'success', 
            text: 'Conta criada com sucesso! Redirecionando...' 
          });
          
          // Aguardar um pouco antes de redirecionar
          setTimeout(() => {
            if (role === UserRole.SUPER_ADMIN) {
              navigate('/admin');
            } else if (role === UserRole.BUSINESS_OWNER) {
              navigate('/owner');
            } else {
              navigate('/explore');
            }
            window.location.reload(); // Recarregar para atualizar estado de autenticação
          }, 1500);
        } else {
          // Se o perfil não foi criado automaticamente, criar manualmente
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              role: role,
              email: email.trim(),
              name: name.trim()
            });
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            setMessage({ 
              type: 'error', 
              text: 'Conta criada, mas houve um erro ao criar o perfil. Entre em contato com o suporte.' 
            });
            return;
          }
          
          setMessage({ 
            type: 'success', 
            text: 'Conta criada com sucesso! Redirecionando...' 
          });
          
          setTimeout(() => {
            if (role === UserRole.SUPER_ADMIN) {
              navigate('/admin');
            } else if (role === UserRole.BUSINESS_OWNER) {
              navigate('/owner');
            } else {
              navigate('/explore');
            }
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
      console.error('Erro ao fazer cadastro:', error);
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
              {role === UserRole.CUSTOMER && (
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <User className="text-indigo-600" size={24} />
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              {role === UserRole.SUPER_ADMIN && 'Cadastro Admin'}
              {role === UserRole.BUSINESS_OWNER && 'Cadastro Estabelecimento'}
              {role === UserRole.CUSTOMER && 'Criar Conta'}
            </h1>
            <p className="text-slate-500 font-medium">
              Preencha os dados para criar sua conta
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
          
          {/* Formulário de Cadastro */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserIcon size={20} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage(null);
                  }}
                  placeholder="Seu nome completo"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>
            
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setMessage(null);
                  }}
                  placeholder="Digite a senha novamente"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate(`/login?role=${role}`)}
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
              >
                Faça login aqui
              </button>
            </p>
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
