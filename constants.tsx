
import React from 'react';
import { Scissors, ShoppingBag, Users, LayoutDashboard, Settings, CreditCard, Home, Calendar } from 'lucide-react';
import { UserRole } from './types';

export const NAVIGATION = {
  [UserRole.CUSTOMER]: [
    { label: 'Início', icon: <Home size={20} />, path: '/' },
    { label: 'Explorar', icon: <Scissors size={20} />, path: '/explore' },
    { label: 'Meus Pedidos', icon: <ShoppingBag size={20} />, path: '/orders' },
  ],
  [UserRole.BUSINESS_OWNER]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/owner' },
    { label: 'Agendamentos', icon: <Calendar size={20} />, path: '/owner/appointments' },
    { label: 'Produtos', icon: <ShoppingBag size={20} />, path: '/owner/products' },
    { label: 'Serviços', icon: <Scissors size={20} />, path: '/owner/services' },
    { label: 'Equipe', icon: <Users size={20} />, path: '/owner/team' },
    { label: 'Financeiro', icon: <CreditCard size={20} />, path: '/owner/finance' },
    { label: 'Configurações', icon: <Settings size={20} />, path: '/owner/settings' },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'Painel Geral', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'Parceiros', icon: <Users size={20} />, path: '/admin/partners' },
    { label: 'Transações', icon: <CreditCard size={20} />, path: '/admin/transactions' },
    { label: 'Usuários', icon: <Users size={20} />, path: '/admin/users' },
    { label: 'Configurações', icon: <Settings size={20} />, path: '/admin/settings' },
  ]
};

export const PLATFORM_FEE = 10; // Default 10%
