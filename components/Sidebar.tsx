
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Scissors } from 'lucide-react';
import { UserRole } from '../types';
import { NAVIGATION } from '../constants';
import { api } from '../services/mockApi';

interface SidebarProps {
  role: UserRole;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, userName }) => {
  const navigate = useNavigate();
  const menuItems = NAVIGATION[role];

  const handleLogout = () => {
    api.logout();
    navigate('/');
    window.location.reload();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Scissors className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">BelezaHub</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Logado como</p>
          <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
