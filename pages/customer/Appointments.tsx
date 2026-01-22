
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { Appointment, Business } from '../../types';
import { Calendar, Clock, CheckCircle2, User, Store, Scissors, MapPin } from 'lucide-react';

export const CustomerAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<(Appointment & { businessName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      const currentUser = await api.getCurrentUser();
      if (!currentUser) return;

      const businesses = await api.getBusinesses();
      const allAppointments: (Appointment & { businessName?: string })[] = [];

      for (const business of businesses) {
        const businessAppointments = await api.getAppointments(business.id);
        const customerAppointments = businessAppointments
          .filter(a => a.customer_name === currentUser.name)
          .map(a => ({ ...a, businessName: business.name }));
        allAppointments.push(...customerAppointments);
      }

      // Ordena por data (mais recentes primeiro)
      allAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(allAppointments);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateStr: string, time: string) => {
    const appointmentDate = new Date(`${dateStr} ${time}`);
    return appointmentDate >= new Date();
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(apt.date, apt.time);
    if (filter === 'past') return !isUpcoming(apt.date, apt.time);
    return true;
  });

  const upcomingCount = appointments.filter(a => isUpcoming(a.date, a.time)).length;
  const pastCount = appointments.filter(a => !isUpcoming(a.date, a.time)).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Meus Agendamentos</h1>
        <p className="text-slate-500">Acompanhe seus serviços agendados.</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filter === 'all' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
          }`}
        >
          Todos ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filter === 'upcoming' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'
          }`}
        >
          Próximos ({upcomingCount})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filter === 'past' 
              ? 'bg-slate-600 text-white shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          Anteriores ({pastCount})
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.map(appointment => {
          const upcoming = isUpcoming(appointment.date, appointment.time);
          
          return (
            <div 
              key={appointment.id} 
              className={`bg-white p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
                upcoming 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Ícone de Status */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                  appointment.status === 'CONFIRMED' 
                    ? 'bg-green-100' 
                    : appointment.status === 'PENDING'
                    ? 'bg-amber-100'
                    : appointment.status === 'CANCELLED'
                    ? 'bg-red-100'
                    : 'bg-slate-100'
                }`}>
                  {appointment.status === 'CONFIRMED' ? (
                    <CheckCircle2 size={32} className="text-green-600" />
                  ) : appointment.status === 'PENDING' ? (
                    <Clock size={32} className="text-amber-600" />
                  ) : (
                    <Scissors size={32} className="text-slate-400" />
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      appointment.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : appointment.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {appointment.status === 'CONFIRMED' ? 'Confirmado' : 
                       appointment.status === 'PENDING' ? 'Pendente' :
                       appointment.status === 'CANCELLED' ? 'Cancelado' : 'Concluído'}
                    </span>
                    {upcoming && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        Próximo
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1">{appointment.service_name}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Store size={14} />
                    <span className="font-medium">{appointment.businessName || 'Estabelecimento'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar size={14} className="text-indigo-500" />
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Clock size={14} className="text-indigo-500" />
                      {appointment.time}
                    </span>
                  </div>
                </div>

                {/* Preço */}
                <div className="flex flex-col items-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-sm text-slate-400">Valor</span>
                  <span className="text-2xl font-black text-green-600">
                    R$ {appointment.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">
              {filter === 'all' 
                ? 'Você ainda não tem agendamentos.' 
                : filter === 'upcoming'
                ? 'Nenhum agendamento próximo.'
                : 'Nenhum agendamento anterior.'}
            </h3>
            <p className="text-slate-400 mt-2">Explore os estabelecimentos e agende um serviço!</p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Explorar Estabelecimentos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
