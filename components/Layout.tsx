
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History, 
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Users as UsersIcon,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Stock IN', path: '/stock-in', icon: ArrowUpCircle },
    { name: 'Stock OUT', path: '/stock-out', icon: ArrowDownCircle },
    { name: 'Stock Logs', path: '/transactions', icon: History },
    { name: 'Party Report', path: '/customer-report', icon: Briefcase },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ name: 'User Management', path: '/users', icon: UsersIcon });
  }

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-brand-dark text-white shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
            <Logo size={36} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter block leading-tight">STOCKMASTER</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Enterprise Pro</span>
          </div>
        </div>

        <nav className="flex-1 px-5 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-brand-red text-white font-bold shadow-xl shadow-brand-red/20 translate-x-1' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="text-[13px] font-black uppercase tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800/50 bg-black/10">
          <div className="flex items-center gap-4 px-2 mb-6">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white shadow-lg ring-4 ring-white/5">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate uppercase tracking-tight">{user.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{user.role} ACCESS</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-white/5"
          >
            <LogOut size={16} />
            Secure Logout
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
            <span>Build v1.0.4-PRO</span>
            <div className="w-1 h-1 bg-brand-red rounded-full"></div>
            <span>SR-ENT</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header - Mobile */}
        <header className="md:hidden bg-white border-b px-6 py-4 flex items-center justify-between no-print relative z-30">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="text-lg font-black text-brand-dark tracking-tighter uppercase">SR STOCKMASTER</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-3 bg-slate-50 rounded-xl text-slate-800 shadow-sm active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-brand-dark text-white flex flex-col animate-in fade-in slide-in-from-top duration-300">
            <div className="p-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <span className="text-xl font-black tracking-tighter">STOCKMASTER PRO</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 bg-white/5 rounded-xl hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-8 space-y-6 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-6 text-xl py-4 px-6 rounded-2xl transition-all ${
                      isActive ? 'bg-brand-red font-black shadow-2xl shadow-brand-red/40' : 'text-slate-400 font-bold'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="uppercase tracking-widest text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-8 border-t border-slate-800 bg-black/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-dark shadow-xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role} ACCESS LEVEL</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-4 text-sm w-full py-5 bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl"
              >
                <LogOut size={20} />
                Terminate Session
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth relative z-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
