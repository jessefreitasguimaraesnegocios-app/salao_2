
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Scissors, Bell, X, Calendar, Clock, CheckCircle2, User } from 'lucide-react';
import { UserRole, Appointment } from '../types';
import { NAVIGATION } from '../constants';
import { api } from '../services/supabaseApi';
import { logout as authLogout } from '../services/authService';

interface SidebarProps {
  role: UserRole;
  userName: string;
  businessId?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, userName, businessId, isMobileOpen = false, onMobileClose }) => {
  const navigate = useNavigate();
  const menuItems = NAVIGATION[role];
  const [showNotifications, setShowNotifications] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fecha o menu mobile quando navegar
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      const handleRouteChange = () => {
        onMobileClose();
      };
      // Fecha quando o componente desmontar ou quando a rota mudar
      return () => {
        handleRouteChange();
      };
    }
  }, [isMobileOpen, onMobileClose]);

  // Carrega agendamentos confirmados - Apenas para Business Owner
  useEffect(() => {
    const loadAppointments = async () => {
      if (role === UserRole.BUSINESS_OWNER && businessId) {
        const allAppointments = await api.getAppointments(businessId);
        const recentAppointments = allAppointments.filter(
          a => a.status === 'CONFIRMED' || a.status === 'PENDING'
        );
        setAppointments(recentAppointments);
        setUnreadCount(recentAppointments.filter(a => a.status === 'CONFIRMED').length);
      }
    };
    
    if (role === UserRole.BUSINESS_OWNER) {
      loadAppointments();
      // Atualiza a cada 5 segundos
      const interval = setInterval(loadAppointments, 5000);
      return () => clearInterval(interval);
    }
  }, [businessId, role]);

  const handleLogout = async () => {
    try {
      // Tentar logout do Supabase Auth primeiro
      await authLogout();
    } catch (error) {
      console.warn('Erro ao fazer logout do Supabase:', error);
    }
    // Limpar localStorage
    api.logout();
    navigate('/');
    window.location.reload();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Scissors className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">Meu Salão App</span>
        {/* Botão de fechar no mobile */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden ml-auto p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Botão de Notificações - Apenas para Business Owner */}
        {role === UserRole.BUSINESS_OWNER && (
          <button
            onClick={() => {
              setShowNotifications(true);
              if (onMobileClose) onMobileClose();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white w-full relative"
          >
            <Bell size={20} />
            <span className="font-medium">Notificações</span>
            {unreadCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Logado como</p>
          <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
        </div>
        <button
          onClick={() => {
            handleLogout();
            if (onMobileClose) onMobileClose();
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile - Drawer */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="md:hidden flex flex-col w-80 h-screen bg-slate-900 text-white fixed left-0 top-0 z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Modal de Notificações - Apenas para Business Owner */}
      {showNotifications && role === UserRole.BUSINESS_OWNER && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Notificações</h2>
                  <p className="text-xs text-indigo-200">Agendamentos confirmados</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-[60vh] overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-4 hover:bg-slate-50 transition-all ${
                        appointment.status === 'CONFIRMED' ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          appointment.status === 'CONFIRMED' 
                            ? 'bg-green-100' 
                            : 'bg-amber-100'
                        }`}>
                          {appointment.status === 'CONFIRMED' ? (
                            <CheckCircle2 size={20} className="text-green-600" />
                          ) : (
                            <Clock size={20} className="text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              appointment.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {appointment.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{appointment.service_name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <User size={12} />
                            <span>{appointment.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar size={12} />
                              {formatDate(appointment.date)}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock size={12} />
                              {appointment.time}
                            </span>
                          </div>
                          <p className="mt-2 font-bold text-green-600">
                            R$ {appointment.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {appointments.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/owner/appointments');
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
                >
                  Ver Todos os Agendamentos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
