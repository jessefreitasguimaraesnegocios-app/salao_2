/**
 * Serviço de Autenticação OTP
 * 
 * Gerencia autenticação sem senha usando OTP (One-Time Password)
 * via telefone ou email com Supabase Auth
 */

import { getSupabaseClient } from './supabaseClient';
import { UserRole } from '../types';

export interface Profile {
  id: string;
  role: UserRole;
  name: string | null;
  phone: string | null;
  email: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Valida formato de telefone brasileiro
 * Aceita: (11) 98765-4321, 11987654321, 987654321, etc.
 */
export function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '');
  // Aceita 10 ou 11 dígitos (com ou sem DDD)
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza telefone para formato internacional
 * Converte para formato: +5511987654321
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Se tem 10 dígitos, assume DDD 11 (São Paulo)
  if (digits.length === 10) {
    return `+5511${digits}`;
  }
  
  // Se tem 11 dígitos, assume que já tem DDD
  if (digits.length === 11) {
    return `+55${digits}`;
  }
  
  // Se já começa com +, retorna como está
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Fallback: adiciona +55
  return `+55${digits}`;
}

/**
 * Envia OTP via telefone ou email
 * @param phoneOrEmail - Telefone ou email do usuário
 * @param role - Role do usuário (opcional, padrão: CUSTOMER)
 */
export async function sendOTP(phoneOrEmail: string, role?: UserRole): Promise<OTPResponse> {
  try {
    const supabase = getSupabaseClient();
    
    // Determinar se é telefone ou email
    const isPhone = isValidPhone(phoneOrEmail);
    const isEmail = isValidEmail(phoneOrEmail);
    
    if (!isPhone && !isEmail) {
      return {
        success: false,
        message: 'Por favor, insira um telefone ou email válido.',
        error: 'INVALID_INPUT'
      };
    }
    
    // Preparar metadata com role (se fornecido)
    const metadata: Record<string, any> = {};
    if (role) {
      metadata.role = role;
    }
    
    let response;
    
    if (isPhone) {
      // Enviar OTP via SMS
      const normalizedPhone = normalizePhone(phoneOrEmail);
      response = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          channel: 'sms',
          data: metadata
        }
      });
    } else {
      // Enviar OTP via Email
      response = await supabase.auth.signInWithOtp({
        email: phoneOrEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login${role ? `?role=${role}` : ''}`,
          data: metadata
        }
      });
    }
    
    if (response.error) {
      console.error('Erro ao enviar OTP:', response.error);
      return {
        success: false,
        message: response.error.message || 'Erro ao enviar código. Tente novamente.',
        error: response.error.message
      };
    }
    
    return {
      success: true,
      message: isPhone 
        ? 'Código enviado por SMS!' 
        : 'Código enviado por email!'
    };
  } catch (error: any) {
    console.error('Erro ao enviar OTP:', error);
    return {
      success: false,
      message: 'Erro inesperado ao enviar código. Tente novamente.',
      error: error.message
    };
  }
}

/**
 * Valida código OTP e autentica o usuário
 */
export async function verifyOTP(
  phoneOrEmail: string,
  token: string,
  type: 'sms' | 'email'
): Promise<OTPResponse> {
  try {
    const supabase = getSupabaseClient();
    
    // Determinar se é telefone ou email
    const isPhone = isValidPhone(phoneOrEmail);
    
    let response;
    
    if (isPhone) {
      const normalizedPhone = normalizePhone(phoneOrEmail);
      response = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: token,
        type: type
      });
    } else {
      response = await supabase.auth.verifyOtp({
        email: phoneOrEmail,
        token: token,
        type: type
      });
    }
    
    if (response.error) {
      console.error('Erro ao verificar OTP:', response.error);
      return {
        success: false,
        message: response.error.message || 'Código inválido. Tente novamente.',
        error: response.error.message
      };
    }
    
    if (response.data.session) {
      // Perfil será criado automaticamente pelo trigger SQL
      return {
        success: true,
        message: 'Autenticação realizada com sucesso!'
      };
    }
    
    return {
      success: false,
      message: 'Erro ao criar sessão. Tente novamente.',
      error: 'NO_SESSION'
    };
  } catch (error: any) {
    console.error('Erro ao verificar OTP:', error);
    return {
      success: false,
      message: 'Erro inesperado ao verificar código. Tente novamente.',
      error: error.message
    };
  }
}

/**
 * Busca perfil do usuário autenticado
 */
export async function getUserProfile(): Promise<Profile | null> {
  try {
    const supabase = getSupabaseClient();
    
    // Verificar sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }
    
    // Buscar perfil na tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

/**
 * Faz logout do usuário
 */
export async function logout(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

/**
 * Verifica se há uma sessão ativa
 */
export async function hasActiveSession(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém o usuário atual da sessão
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}
