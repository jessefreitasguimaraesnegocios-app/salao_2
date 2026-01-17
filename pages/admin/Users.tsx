
import React, { useState, useEffect } from 'react';
import { api } from '../../services/mockApi';
import { UserProfile, UserRole } from '../../types';
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus, 
  Shield, 
  Store, 
  User, 
  Mail, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  AlertCircle 
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await api.saveUser(editingUser as any);
    setIsModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este usuário do sistema?')) {
      await api.deleteUser(id);
      load();
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case UserRole.SUPER_ADMIN:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase border border-purple-100"><Shield size={12} /> Admin</span>;
      case UserRole.BUSINESS_OWNER:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase border border-indigo-100"><Store size={12} /> Lojista</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase border border-slate-200"><User size={12} /> Cliente</span>;
    }
  };

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 font-medium">Controle de acessos e permissões globais da plataforma.</p>
        </div>
        <button 
          onClick={() => { setEditingUser({ role: UserRole.CUSTOMER }); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
        >
          <UserPlus size={24} /> Criar Usuário
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Nome ou e-mail..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setRoleFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${roleFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setRoleFilter(UserRole.BUSINESS_OWNER)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${roleFilter === UserRole.BUSINESS_OWNER ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            >
              Lojistas
            </button>
            <button 
              onClick={() => setRoleFilter(UserRole.SUPER_ADMIN)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${roleFilter === UserRole.SUPER_ADMIN ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            >
              Admins
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-10 py-5">Usuário</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status Segurança</th>
                <th className="px-6 py-5">ID Business</th>
                <th className="px-10 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xl border border-slate-200 shadow-inner">
                        {u.name[0]}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 block text-base">{u.name}</span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Mail size={12} /> {u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Shield size={14} className={u.security?.two_factor_enabled ? "text-green-500" : "text-slate-300"} />
                      {u.security?.two_factor_enabled ? '2FA Ativo' : 'Senha Simples'}
                    </div>
                  </td>
                  <td className="px-6 py-6 font-mono text-[10px] text-slate-400 font-bold uppercase">
                    {u.business_id || '--'}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <UsersIcon className="mx-auto text-slate-100 mb-6" size={80} />
              <h3 className="text-2xl font-black text-slate-300">Nenhum usuário encontrado</h3>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">{editingUser?.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                    value={editingUser?.name || ''}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">E-mail de Acesso</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                    value={editingUser?.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Nível de Permissão</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white font-bold"
                    value={editingUser?.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.CUSTOMER}>Cliente</option>
                    <option value={UserRole.BUSINESS_OWNER}>Lojista (Parceiro)</option>
                    <option value={UserRole.SUPER_ADMIN}>Administrador do Hub</option>
                  </select>
                </div>

                {editingUser?.role === UserRole.BUSINESS_OWNER && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3 text-indigo-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase leading-relaxed">Usuários Lojistas devem ser vinculados a um ID de Business manualmente na base de dados em produção.</p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <Save size={24} /> {editingUser?.id ? 'Aplicar Alterações' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
