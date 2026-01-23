/**
 * Componente de Login OTP (One-Time Password)
 * 
 * Permite que usuários façam login sem senha usando código OTP
 * enviado via telefone ou email
 * Suporta diferentes roles: CUSTOMER, BUSINESS_OWNER, SUPER_ADMIN
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Phone, Loader2, ArrowLeft, CheckCircle, AlertCircle, Store, ShieldCheck, User } from 'lucide-react';
import { sendOTP, verifyOTP, isValidPhone, isValidEmail } from '../../services/authService';
import { UserRole } from '../../types';

type LoginStep = 'input' | 'verify';

interface OTPLoginProps {
  role?: UserRole;
}

export const OTPLogin: React.FC<OTPLoginProps> = ({ role: propRole }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determinar role: prop > query param > CUSTOMER (padrão)
  // IMPORTANTE: OTP é apenas para clientes. Owners e Admins devem usar /login-password
  const role = propRole || (searchParams.get('role') as UserRole) || UserRole.CUSTOMER;
  
  // Redirecionar se tentar usar OTP para owners/admins
  React.useEffect(() => {
    if (role !== UserRole.CUSTOMER) {
      navigate(`/login-password?role=${role}`);
    }
  }, [role, navigate]);
  
  // Estado do formulário
  const [step, setStep] = useState<LoginStep>('input');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isPhone, setIsPhone] = useState<boolean | null>(null);
  
  // Estado de loading e mensagens
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Determinar se é telefone ou email
  const detectInputType = (value: string): boolean | null => {
    if (!value) return null;
    if (isValidPhone(value)) return true;
    if (isValidEmail(value)) return false;
    return null;
  };
  
  // Handler para mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneOrEmail(value);
    setMessage(null);
    
    // Detectar tipo automaticamente
    const detectedType = detectInputType(value);
    setIsPhone(detectedType);
  };
  
  // Enviar código OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar input
    if (!phoneOrEmail.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira um telefone ou email.' });
      return;
    }
    
    const inputType = detectInputType(phoneOrEmail);
    if (inputType === null) {
      setMessage({ type: 'error', text: 'Por favor, insira um telefone ou email válido.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await sendOTP(phoneOrEmail, role);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setStep('verify');
        setOtpCode(''); // Limpar código anterior
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
      console.error('Erro ao enviar OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar código OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar código (6 dígitos)
    if (!otpCode.trim() || otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setMessage({ type: 'error', text: 'Por favor, insira um código de 6 dígitos.' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const inputType = isPhone ? 'sms' : 'email';
      const response = await verifyOTP(phoneOrEmail, otpCode, inputType);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Login realizado com sucesso! Redirecionando...' });
        
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          // Redirecionar baseado no role
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
        setMessage({ type: 'error', text: response.message });
        setOtpCode(''); // Limpar código em caso de erro
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
      console.error('Erro ao verificar OTP:', error);
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Voltar para input
  const handleBack = () => {
    setStep('input');
    setOtpCode('');
    setMessage(null);
  };
  
  // Reenviar código
  const handleResend = async () => {
    setOtpCode('');
    setMessage(null);
    await handleSendOTP(new Event('submit') as any);
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
              {role === UserRole.SUPER_ADMIN && 'Acesso Admin'}
              {role === UserRole.BUSINESS_OWNER && 'Acesso Estabelecimento'}
              {role === UserRole.CUSTOMER && 'Entrar no Meu Salão App'}
            </h1>
            <p className="text-slate-500 font-medium">
              {step === 'input' 
                ? 'Digite seu telefone ou email para receber um código de acesso'
                : 'Digite o código de 6 dígitos que enviamos para você'
              }
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
          
          {/* Formulário de Input (Telefone/Email) */}
          {step === 'input' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="phoneOrEmail" className="block text-sm font-bold text-slate-700 mb-2">
                  Telefone ou Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {isPhone === true ? (
                      <Phone size={20} />
                    ) : isPhone === false ? (
                      <Mail size={20} />
                    ) : (
                      <Mail size={20} />
                    )}
                  </div>
                  <input
                    id="phoneOrEmail"
                    type="text"
                    value={phoneOrEmail}
                    onChange={handleInputChange}
                    placeholder={isPhone === true ? "Ex: (11) 98765-4321" : "Ex: seu@email.com"}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-medium"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {isPhone !== null && (
                  <p className="mt-2 text-xs text-slate-500">
                    {isPhone 
                      ? '📱 Código será enviado por SMS'
                      : '📧 Código será enviado por Email'
                    }
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !phoneOrEmail.trim() || isPhone === null}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Código
                    <Phone size={20} />
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Formulário de Verificação (OTP) */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otpCode" className="block text-sm font-bold text-slate-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    // Aceitar apenas números e limitar a 6 dígitos
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(value);
                    setMessage(null);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 font-black text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Código enviado para: <span className="font-bold">{phoneOrEmail}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Código'
                  )}
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Voltar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Reenviar
                  </button>
                </div>
              </div>
            </form>
          )}
          
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
            🔒 Seus dados estão seguros. Nunca pedimos sua senha.
          </p>
        </div>
      </div>
    </div>
  );
};
