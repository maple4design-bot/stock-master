
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  User as UserFieldIcon, 
  X,
  HelpCircle,
  PhoneCall,
  Mail,
  Smartphone
} from 'lucide-react';
import { Role, User } from '../types';
import Logo from '../components/Logo';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [role, setRole] = useState<Role>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // LOGO CONFIGURATION: 
  // Change 'imageUrl' to your own logo path to replace the SVG logo
  const LOGO_URL = undefined; // e.g., "/assets/my-logo.png"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Required: Username & Password');
      return;
    }
    
    const foundUser = users.find(
      u => u.name.toLowerCase() === username.toLowerCase() && 
      u.password === password && 
      u.role === role
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Authentication failed. Check details.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-[440px] overflow-hidden border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-50/80 p-10 md:p-12 border-b border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/5 rounded-full -mr-24 -mt-24"></div>
          
          <div className="mx-auto mb-8 flex justify-center relative">
            <div className="p-6 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 transform transition-transform hover:rotate-3 duration-300">
              <Logo size={70} imageUrl={LOGO_URL} />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tighter uppercase leading-none">SR StockMaster</h1>
          <p className="text-slate-400 mt-3 font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Inventory Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-brand-red text-[10px] font-black rounded-2xl text-center uppercase tracking-widest animate-bounce">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Access Profile</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
                  role === 'ADMIN' 
                    ? 'border-brand-red bg-red-50 text-brand-red shadow-lg shadow-red-100' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <ShieldCheck size={18} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
                  role === 'CUSTOMER' 
                    ? 'border-brand-red bg-red-50 text-brand-red shadow-lg shadow-red-100' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Smartphone size={18} />
                Staff
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors">
                <UserFieldIcon size={20} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Username"
                autoComplete="username"
                className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-red/5 focus:bg-white focus:border-brand-red transition-all font-bold text-slate-800 text-sm placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-red/5 focus:bg-white focus:border-brand-red transition-all font-bold text-slate-800 text-sm placeholder:text-slate-300"
                />
              </div>
              <div className="flex justify-end pr-2">
                <button 
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[10px] font-black text-slate-400 hover:text-brand-red uppercase tracking-widest transition-colors decoration-dotted hover:underline underline-offset-4"
                >
                  Need help logging in?
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-dark hover:bg-black text-white font-black py-5 rounded-[1.25rem] shadow-2xl shadow-slate-300 transition-all active:scale-[0.97] uppercase tracking-[0.3em] text-xs hover:shadow-brand-red/10"
          >
            Authenticate Access
          </button>
        </form>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          SR ENTERPRISE SYSTEMS &copy; 2025
        </div>
      </div>

      {/* Recovery Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md transition-opacity" onClick={() => setIsForgotModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-300">
            <div className="bg-brand-red p-10 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Secure Recovery</h2>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Identity Verification Required</p>
            </div>
            
            <div className="p-10 space-y-8">
              <p className="text-sm text-slate-500 font-medium text-center leading-relaxed">
                For enterprise security, password resets are handled exclusively by your <strong>System Administrator</strong>.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-red shadow-sm border border-slate-100">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Desk</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">IT-SEC-AUTH-SR</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-red shadow-sm border border-slate-100">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Node</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">auth@sr-enterprise.io</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full bg-brand-dark text-white font-black py-5 rounded-[1.25rem] text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
