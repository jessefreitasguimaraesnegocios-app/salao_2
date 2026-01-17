
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { Appointment, Service } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  X,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';

export const OwnerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New Appointment Form State
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    customer_name: '',
    customer_phone: '',
    service_id: '',
    time: '09:00',
    status: 'CONFIRMED'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await api.getCurrentUser();
    if (user?.business_id) {
      const [appts, svcs] = await Promise.all([
        api.getAppointments(user.business_id),
        api.getServices(user.business_id)
      ]);
      setAppointments(appts);
      setServices(svcs.filter(s => s.is_active));
    }
  };

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await api.updateAppointmentStatus(id, status);
    loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await api.getCurrentUser();
    const service = services.find(s => s.id === newAppt.service_id);
    
    if (user?.business_id && service) {
      await api.saveAppointment({
        ...newAppt,
        business_id: user.business_id,
        service_name: service.name,
        price: service.price,
        date: selectedDate,
        status: 'CONFIRMED'
      } as any);
      
      setIsModalOpen(false);
      setNewAppt({
        customer_name: '',
        customer_phone: '',
        service_id: '',
        time: '09:00',
        status: 'CONFIRMED'
      });
      loadData();
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const filteredAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const statusMap = {
    PENDING: { label: 'Pendente', class: 'bg-amber-50 text-amber-600 border-amber-100' },
    CONFIRMED: { label: 'Confirmado', class: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    COMPLETED: { label: 'Concluído', class: 'bg-green-50 text-green-600 border-green-100' },
    CANCELLED: { label: 'Cancelado', class: 'bg-red-50 text-red-600 border-red-100' }
  };

  return (
    <div className="p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agenda de Clientes</h1>
          <p className="text-slate-500 font-medium">Controle total sobre o seu tempo e atendimentos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-700 text-sm cursor-pointer"
              />
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map(appt => (
          <div 
            key={appt.id} 
            className={`bg-white p-6 rounded-[32px] border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 ${appt.status === 'CANCELLED' ? 'opacity-60 border-slate-100' : 'border-slate-200'}`}
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center justify-center bg-slate-900 text-white w-20 h-20 rounded-[24px] shrink-0 shadow-lg shadow-slate-200">
                <Clock size={16} className="mb-1 text-indigo-400" />
                <span className="text-xl font-black">{appt.time}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900">{appt.customer_name}</h3>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${statusMap[appt.status].class}`}>
                    {statusMap[appt.status].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 italic">
                    <CalendarCheck size={14} className="text-indigo-400" /> {appt.service_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" /> {appt.customer_phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="md:text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">Valor do Serviço</p>
                <p className="text-2xl font-black text-slate-900">R$ {appt.price.toFixed(2)}</p>
              </div>
              
              <div className="flex gap-2">
                {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                      className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-90"
                      title="Concluir Atendimento"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                      className="p-4 bg-white text-red-500 border border-red-100 rounded-2xl hover:bg-red-50 transition-all active:scale-90"
                      title="Cancelar"
                    >
                      <XCircle size={20} />
                    </button>
                  </>
                )}
                {appt.status === 'COMPLETED' && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-xs">
                     <CheckCircle size={14} /> Finalizado
                   </div>
                )}
                <button className="p-4 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="text-slate-200" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Nenhum cliente para hoje</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Aproveite para organizar seu estoque ou prospectar novos clientes!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all"
            >
              Criar Primeiro Agendamento
            </button>
          </div>
        )}
      </div>

      {/* Modal de Novo Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Agendar Cliente</h3>
                <p className="text-slate-500 text-sm font-medium">Preencha os dados do atendimento manual.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome do Cliente</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Carlos Alberto"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      value={newAppt.customer_name}
                      onChange={(e) => setNewAppt({...newAppt, customer_name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">WhatsApp / Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                    <input 
                      type="tel" 
                      required
                      placeholder="(00) 00000-0000"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      value={newAppt.customer_phone}
                      onChange={(e) => setNewAppt({...newAppt, customer_phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                      <input 
                        type="time" 
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                        value={newAppt.time}
                        onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Serviço</label>
                    <select 
                      required
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none bg-white font-bold text-slate-700"
                      value={newAppt.service_id}
                      onChange={(e) => setNewAppt({...newAppt, service_id: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {services.length === 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">Você não possui serviços ativos cadastrados. Cadastre um serviço primeiro para agendar.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={services.length === 0}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Confirmar e Agendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
