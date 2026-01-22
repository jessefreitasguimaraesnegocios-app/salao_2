
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProfile, UserRole } from './types';
import { api } from './services/mockApi';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { OwnerDashboard } from './pages/owner/Dashboard';
import { OwnerProducts } from './pages/owner/Products';
import { OwnerServices } from './pages/owner/Services';
import { OwnerFinance } from './pages/owner/Finance';
import { OwnerAppointments } from './pages/owner/Appointments';
import { OwnerTeam } from './pages/owner/Team';
import { OwnerSettings } from './pages/owner/Settings';
import { CustomerExplore } from './pages/customer/Explore';
import { CustomerOrders } from './pages/customer/Orders';
import { CustomerAppointments } from './pages/customer/Appointments';
import { StoreDetail } from './pages/customer/StoreDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPartners } from './pages/admin/Partners';
import { AdminTransactions } from './pages/admin/Transactions';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';
import { Menu, X } from 'lucide-react';

const Layout: React.FC<{ user: UserProfile, children: React.ReactNode }> = ({ user, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        role={user.role} 
        userName={user.name} 
        businessId={user.business_id}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between shadow-sm">
        <span className="font-black text-xl text-indigo-600">Meu Salão App</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="mt-4 text-slate-400 font-medium animate-pulse">Carregando Meu Salão App...</p>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.role === UserRole.SUPER_ADMIN ? "/admin" : (user.role === UserRole.BUSINESS_OWNER ? "/owner" : "/explore")} />} />
        
        {/* Customer Routes */}
        <Route path="/explore" element={user ? <Layout user={user}><CustomerExplore /></Layout> : <Navigate to="/" />} />
        <Route path="/store/:id" element={user ? <Layout user={user}><StoreDetail /></Layout> : <Navigate to="/" />} />
        <Route path="/orders" element={user ? <Layout user={user}><CustomerOrders /></Layout> : <Navigate to="/" />} />
        <Route path="/appointments" element={user ? <Layout user={user}><CustomerAppointments /></Layout> : <Navigate to="/" />} />
        
        {/* Owner Routes */}
        <Route path="/owner" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerDashboard /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/appointments" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerAppointments /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/products" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerProducts /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/services" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerServices /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/team" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerTeam /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/finance" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerFinance /></Layout> : <Navigate to="/" />} />
        <Route path="/owner/settings" element={user?.role === UserRole.BUSINESS_OWNER ? <Layout user={user}><OwnerSettings /></Layout> : <Navigate to="/" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === UserRole.SUPER_ADMIN ? <Layout user={user}><AdminDashboard /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/partners" element={user?.role === UserRole.SUPER_ADMIN ? <Layout user={user}><AdminPartners /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/transactions" element={user?.role === UserRole.SUPER_ADMIN ? <Layout user={user}><AdminTransactions /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/users" element={user?.role === UserRole.SUPER_ADMIN ? <Layout user={user}><AdminUsers /></Layout> : <Navigate to="/" />} />
        <Route path="/admin/settings" element={user?.role === UserRole.SUPER_ADMIN ? <Layout user={user}><AdminSettings /></Layout> : <Navigate to="/" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
