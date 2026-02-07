
import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  X, 
  AlertTriangle,
  Lock,
  BadgeCheck
} from 'lucide-react';
import { User, Role } from '../types';

interface UsersProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    password: '',
    role: 'CUSTOMER' as Role
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.password) return;

    onAddUser({
      id: crypto.randomUUID(),
      name: newUser.name,
      password: newUser.password,
      role: newUser.role
    });

    setNewUser({ name: '', password: '', role: 'CUSTOMER' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">User Management</h1>
          <p className="text-slate-500 font-medium">Manage access credentials for SR Staff and Admins.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-xs"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </header>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2 ${user.role === 'ADMIN' ? 'text-brand-red' : 'text-slate-300'}`}>
              {user.role === 'ADMIN' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                user.role === 'ADMIN' ? 'bg-brand-dark shadow-slate-200' : 'bg-slate-400 shadow-slate-100'
              }`}>
                <UserIcon size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">{user.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  user.role === 'ADMIN' ? 'bg-red-50 text-brand-red' : 'bg-slate-50 text-slate-500'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                <span>Account ID</span>
                <span className="font-mono text-slate-300">{user.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                <span>Security</span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <BadgeCheck size={14} /> Encrypted
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => onDeleteUser(user.id)}
                className="p-2 text-slate-300 hover:text-brand-red transition-colors"
                title="Remove access"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-dark p-8 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Add User</h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">New access credential</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold"
                    placeholder="Enter full name or staff ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'ADMIN'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-tighter ${
                      newUser.role === 'ADMIN' 
                        ? 'border-brand-red bg-red-50 text-brand-red' 
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'CUSTOMER'})}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-tighter ${
                      newUser.role === 'CUSTOMER' 
                        ? 'border-brand-red bg-red-50 text-brand-red' 
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <UserIcon size={16} />
                    Staff
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-xl shadow-red-100 transition-all uppercase tracking-widest text-xs"
                >
                  Create Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
