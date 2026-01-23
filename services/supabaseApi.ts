/**
 * Serviço de API usando Supabase
 * 
 * Substitui o mockApi, usando Supabase como backend real
 */

import { getSupabaseClient } from './supabaseClient';
import { UserProfile, Business, Product, Service, Transaction, Appointment, TeamMember, UserRole } from '../types';

class SupabaseApi {
  /**
   * Busca usuário atual autenticado
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      // Buscar perfil na tabela profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        return null;
      }
      
      // Converter Profile para UserProfile
      return {
        id: profile.id,
        email: profile.email || '',
        name: profile.name || 'Usuário',
        role: profile.role,
        phone: profile.phone || undefined,
        avatar: profile.avatar || undefined
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  }

  /**
   * Login (mantido para compatibilidade, mas não deve ser usado)
   * Usuários devem usar OTP ou senha via Supabase Auth
   */
  async login(email: string, role: UserRole): Promise<UserProfile | null> {
    console.warn('login() está deprecated. Use OTP ou senha via Supabase Auth.');
    return null;
  }

  /**
   * Logout
   */
  logout() {
    // Limpar localStorage se necessário
    localStorage.removeItem('logged_user_id');
    // O logout real é feito via authService.logout()
  }

  /**
   * Buscar todos os estabelecimentos ativos
   */
  async getBusinesses(): Promise<Business[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'ACTIVE')
        .is('deleted_at', null);
      
      if (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
        return [];
      }
      
      return (data || []).map(b => ({
        id: b.id,
        name: b.name,
        type: b.type as any,
        owner_id: b.owner_id,
        revenue_split: Number(b.revenue_split),
        monthly_fee: Number(b.monthly_fee),
        status: b.status as any,
        description: b.description || '',
        logo: b.logo || undefined,
        cover_image: b.cover_image || undefined,
        mp_connected: b.mp_connected || false,
        address: b.address || undefined,
        opening_hours: b.opening_hours as any || undefined,
        notifications: b.notifications as any || undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      return [];
    }
  }

  /**
   * Buscar estabelecimento por ID
   */
  async getBusinessById(id: string): Promise<Business | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        type: data.type as any,
        owner_id: data.owner_id,
        revenue_split: Number(data.revenue_split),
        monthly_fee: Number(data.monthly_fee),
        status: data.status as any,
        description: data.description || '',
        logo: data.logo || undefined,
        cover_image: data.cover_image || undefined,
        mp_connected: data.mp_connected || false,
        address: data.address || undefined,
        opening_hours: data.opening_hours as any || undefined,
        notifications: data.notifications as any || undefined
      };
    } catch (error) {
      console.error('Erro ao buscar estabelecimento:', error);
      return null;
    }
  }

  /**
   * Buscar produtos de um estabelecimento
   */
  async getProducts(businessId: string): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .is('deleted_at', null);
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return (data || []).map(p => ({
        id: p.id,
        business_id: p.business_id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        image: p.image || '',
        category: p.category || '',
        is_active: p.is_active
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Buscar serviços de um estabelecimento
   */
  async getServices(businessId: string): Promise<Service[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .is('deleted_at', null);
      
      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return [];
      }
      
      return (data || []).map(s => ({
        id: s.id,
        business_id: s.business_id,
        name: s.name,
        price: Number(s.price),
        duration: s.duration,
        is_active: s.is_active
      }));
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  }

  /**
   * Buscar transações de um estabelecimento (ou todas se businessId não fornecido)
   */
  async getTransactions(businessId?: string): Promise<Transaction[]> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
      }
      
      return (data || []).map(t => ({
        id: t.id,
        business_id: t.business_id,
        amount: Number(t.amount),
        admin_fee: Number(t.admin_fee),
        partner_net: Number(t.partner_net),
        status: t.status as any,
        payment_method: t.payment_method as any,
        created_at: t.created_at,
        customer_name: t.customer_name || ''
      }));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  }

  /**
   * Buscar agendamentos de um estabelecimento
   */
  async getAppointments(businessId: string): Promise<Appointment[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return (data || []).map(a => ({
        id: a.id,
        business_id: a.business_id,
        customer_name: a.customer_name,
        customer_phone: a.customer_phone,
        service_id: a.service_id,
        service_name: a.service_name || '',
        date: a.date,
        time: a.time,
        status: a.status as any,
        price: Number(a.price || 0)
      }));
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  }

  /**
   * Buscar membros da equipe de um estabelecimento
   */
  async getTeamMembers(businessId: string): Promise<TeamMember[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'ACTIVE')
        .is('deleted_at', null);
      
      if (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        return [];
      }
      
      return (data || []).map(m => ({
        id: m.id,
        business_id: m.business_id,
        name: m.name,
        role: m.role || '',
        specialties: m.specialties || '',
        avatar: m.avatar || '',
        status: m.status as any,
        bio: m.bio || undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      return [];
    }
  }

  /**
   * Buscar todos os estabelecimentos (para admin)
   */
  async getAllBusinesses(): Promise<Business[]> {
    return this.getBusinesses();
  }

  /**
   * Buscar todas as transações (para admin)
   */
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar todas as transações:', error);
        return [];
      }
      
      return (data || []).map(t => ({
        id: t.id,
        business_id: t.business_id,
        amount: Number(t.amount),
        admin_fee: Number(t.admin_fee),
        partner_net: Number(t.partner_net),
        status: t.status as any,
        payment_method: t.payment_method as any,
        created_at: t.created_at,
        customer_name: t.customer_name || ''
      }));
    } catch (error) {
      console.error('Erro ao buscar todas as transações:', error);
      return [];
    }
  }

  /**
   * Adicionar estabelecimento (para admin)
   */
  async addBusiness(business: Partial<Business>): Promise<Business | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: business.name,
          type: business.type,
          owner_id: business.owner_id,
          revenue_split: business.revenue_split || 10,
          monthly_fee: business.monthly_fee || 149.90,
          status: business.status || 'PENDING',
          description: business.description || '',
          logo: business.logo,
          cover_image: business.cover_image,
          mp_connected: business.mp_connected || false,
          address: business.address,
          opening_hours: business.opening_hours,
          notifications: business.notifications
        })
        .select()
        .single();
      
      if (error || !data) {
        console.error('Erro ao adicionar estabelecimento:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        type: data.type as any,
        owner_id: data.owner_id,
        revenue_split: Number(data.revenue_split),
        monthly_fee: Number(data.monthly_fee),
        status: data.status as any,
        description: data.description || '',
        logo: data.logo || undefined,
        cover_image: data.cover_image || undefined,
        mp_connected: data.mp_connected || false,
        address: data.address || undefined,
        opening_hours: data.opening_hours as any || undefined,
        notifications: data.notifications as any || undefined
      };
    } catch (error) {
      console.error('Erro ao adicionar estabelecimento:', error);
      return null;
    }
  }

  /**
   * Deletar estabelecimento (para admin)
   */
  async deleteBusiness(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('businesses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar estabelecimento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar estabelecimento:', error);
      return false;
    }
  }

  /**
   * Atualizar estabelecimento
   */
  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: updates.name,
          type: updates.type,
          revenue_split: updates.revenue_split,
          monthly_fee: updates.monthly_fee,
          status: updates.status,
          description: updates.description,
          logo: updates.logo,
          cover_image: updates.cover_image,
          mp_connected: updates.mp_connected,
          address: updates.address,
          opening_hours: updates.opening_hours,
          notifications: updates.notifications
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Erro ao atualizar estabelecimento:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        type: data.type as any,
        owner_id: data.owner_id,
        revenue_split: Number(data.revenue_split),
        monthly_fee: Number(data.monthly_fee),
        status: data.status as any,
        description: data.description || '',
        logo: data.logo || undefined,
        cover_image: data.cover_image || undefined,
        mp_connected: data.mp_connected || false,
        address: data.address || undefined,
        opening_hours: data.opening_hours as any || undefined,
        notifications: data.notifications as any || undefined
      };
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      return null;
    }
  }

  /**
   * Salvar produto (criar ou atualizar)
   */
  async saveProduct(product: Partial<Product> & { business_id: string }): Promise<Product | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (product.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image,
            category: product.category,
            is_active: product.is_active
          })
          .eq('id', product.id)
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao atualizar produto:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          price: Number(data.price),
          stock: data.stock,
          image: data.image || '',
          category: data.category || '',
          is_active: data.is_active
        };
      } else {
        // Criar
        const { data, error } = await supabase
          .from('products')
          .insert({
            business_id: product.business_id,
            name: product.name || '',
            price: product.price || 0,
            stock: product.stock || 0,
            image: product.image || '',
            category: product.category || 'Geral',
            is_active: product.is_active !== undefined ? product.is_active : true
          })
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao criar produto:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          price: Number(data.price),
          stock: data.stock,
          image: data.image || '',
          category: data.category || '',
          is_active: data.is_active
        };
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      return null;
    }
  }

  /**
   * Deletar produto
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar produto:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }
  }

  /**
   * Salvar serviço (criar ou atualizar)
   */
  async saveService(service: Partial<Service> & { business_id: string }): Promise<Service | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (service.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('services')
          .update({
            name: service.name,
            price: service.price,
            duration: service.duration,
            is_active: service.is_active
          })
          .eq('id', service.id)
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao atualizar serviço:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          price: Number(data.price),
          duration: data.duration,
          is_active: data.is_active
        };
      } else {
        // Criar
        const { data, error } = await supabase
          .from('services')
          .insert({
            business_id: service.business_id,
            name: service.name || '',
            price: service.price || 0,
            duration: service.duration || 30,
            is_active: service.is_active !== undefined ? service.is_active : true
          })
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao criar serviço:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          price: Number(data.price),
          duration: data.duration,
          is_active: data.is_active
        };
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      return null;
    }
  }

  /**
   * Deletar serviço
   */
  async deleteService(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('services')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar serviço:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      return false;
    }
  }

  /**
   * Salvar membro da equipe (criar ou atualizar)
   */
  async saveTeamMember(member: Partial<TeamMember> & { business_id: string }): Promise<TeamMember | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (member.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('team_members')
          .update({
            name: member.name,
            role: member.role,
            specialties: member.specialties,
            avatar: member.avatar,
            bio: member.bio,
            status: member.status
          })
          .eq('id', member.id)
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao atualizar membro da equipe:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          role: data.role || '',
          specialties: data.specialties || '',
          avatar: data.avatar || '',
          status: data.status as any,
          bio: data.bio || undefined
        };
      } else {
        // Criar
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            business_id: member.business_id,
            name: member.name || '',
            role: member.role || '',
            specialties: member.specialties || '',
            avatar: member.avatar || '',
            bio: member.bio,
            status: member.status || 'ACTIVE'
          })
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao criar membro da equipe:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          name: data.name,
          role: data.role || '',
          specialties: data.specialties || '',
          avatar: data.avatar || '',
          status: data.status as any,
          bio: data.bio || undefined
        };
      }
    } catch (error) {
      console.error('Erro ao salvar membro da equipe:', error);
      return null;
    }
  }

  /**
   * Deletar membro da equipe
   */
  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('team_members')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar membro da equipe:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar membro da equipe:', error);
      return false;
    }
  }

  /**
   * Salvar agendamento (criar ou atualizar)
   */
  async saveAppointment(appointment: Partial<Appointment> & { business_id: string }): Promise<Appointment | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (appointment.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('appointments')
          .update({
            customer_name: appointment.customer_name,
            customer_phone: appointment.customer_phone,
            service_id: appointment.service_id,
            service_name: appointment.service_name,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            price: appointment.price
          })
          .eq('id', appointment.id)
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao atualizar agendamento:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          service_id: data.service_id,
          service_name: data.service_name || '',
          date: data.date,
          time: data.time,
          status: data.status as any,
          price: Number(data.price || 0)
        };
      } else {
        // Criar - usar função RPC se disponível, senão INSERT direto
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            business_id: appointment.business_id,
            customer_name: appointment.customer_name || '',
            customer_phone: appointment.customer_phone || '',
            service_id: appointment.service_id || '',
            service_name: appointment.service_name || '',
            date: appointment.date || '',
            time: appointment.time || '',
            status: appointment.status || 'PENDING',
            price: appointment.price || 0
          })
          .select()
          .single();
        
        if (error || !data) {
          console.error('Erro ao criar agendamento:', error);
          return null;
        }
        
        return {
          id: data.id,
          business_id: data.business_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          service_id: data.service_id,
          service_name: data.service_name || '',
          date: data.date,
          time: data.time,
          status: data.status as any,
          price: Number(data.price || 0)
        };
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      return null;
    }
  }

  /**
   * Atualizar status do agendamento
   */
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      return false;
    }
  }

  /**
   * Criar transação
   */
  async createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    try {
      const supabase = getSupabaseClient();
      
      // Usar função RPC se disponível, senão INSERT direto
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          business_id: tx.business_id,
          amount: tx.amount,
          admin_fee: tx.admin_fee,
          partner_net: tx.partner_net,
          status: tx.status,
          payment_method: tx.payment_method,
          customer_name: tx.customer_name
        })
        .select()
        .single();
      
      if (error || !data) {
        console.error('Erro ao criar transação:', error);
        return null;
      }
      
      return {
        id: data.id,
        business_id: data.business_id,
        amount: Number(data.amount),
        admin_fee: Number(data.admin_fee),
        partner_net: Number(data.partner_net),
        status: data.status as any,
        payment_method: data.payment_method as any,
        created_at: data.created_at,
        customer_name: data.customer_name || ''
      };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return null;
    }
  }

  /**
   * Buscar todos os usuários (para admin)
   */
  async getUsers(): Promise<UserProfile[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }
      
      return (data || []).map(p => ({
        id: p.id,
        email: p.email || '',
        name: p.name || 'Usuário',
        role: p.role,
        phone: p.phone || undefined,
        avatar: p.avatar || undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Salvar usuário (criar ou atualizar perfil)
   */
  async saveUser(user: Partial<UserProfile> & { id?: string }): Promise<UserProfile | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (!user.id) {
        console.error('ID do usuário é obrigatório');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Erro ao atualizar usuário:', error);
        return null;
      }
      
      return {
        id: data.id,
        email: data.email || '',
        name: data.name || 'Usuário',
        role: data.role,
        phone: data.phone || undefined,
        avatar: data.avatar || undefined
      };
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      return null;
    }
  }

  /**
   * Deletar usuário (soft delete no perfil)
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      // Nota: Não deletamos o perfil, apenas marcamos como inativo se necessário
      // O usuário em auth.users deve ser deletado via Supabase Dashboard ou API
      console.warn('deleteUser: Use Supabase Dashboard para deletar usuários de auth.users');
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }
}

export const api = new SupabaseApi();
