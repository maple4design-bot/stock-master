
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  User as UserIcon, 
  Package, 
  Hash, 
  Weight, 
  DollarSign, 
  MessageSquare,
  FileCheck,
  Loader2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Transaction, InventoryItem, User, TransactionType } from '../types';

interface StockFormProps {
  type: TransactionType;
  user: User;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  inventory: InventoryItem[];
  transactions: Transaction[];
}

const StockForm: React.FC<StockFormProps> = ({ type, user, onAdd, inventory, transactions }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: type === 'IN' ? '' : user.name,
    productName: '',
    quantity: '',
    weight: '',
    carryPrice: '',
    remarks: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Extract unique customer/party names from history
  const uniqueCustomers = useMemo(() => {
    const names = Array.from(new Set(transactions.map(tx => tx.customerName)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const currentItem = inventory.find(i => i.productName.toLowerCase() === formData.productName.toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseInt(formData.quantity);
    const wgt = formData.weight ? parseFloat(formData.weight) : 0;
    const price = parseFloat(formData.carryPrice);

    if (type === 'OUT') {
      if (!currentItem) {
        setError('Product not found in current balance.');
        return;
      }
      if (currentItem.totalQuantity < qty) {
        setError(`Insufficient stock. Available: ${currentItem.totalQuantity}`);
        return;
      }
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const id = crypto.randomUUID().slice(0, 8).toUpperCase();
      setGeneratedId(id);
      
      onAdd({
        date: formData.date,
        customerName: formData.customerName.trim(),
        productName: formData.productName.trim(),
        quantity: qty,
        weight: wgt,
        carryPrice: price,
        remarks: formData.remarks,
        type: type
      });
      
      setIsGenerating(false);
      setShowReceipt(true);
    }, 1200);
  };

  if (showReceipt) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          <div className={`${type === 'IN' ? 'bg-emerald-600' : 'bg-brand-red'} p-8 text-white text-center`}>
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <FileCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Entry Completed</h2>
            <p className="opacity-80 font-mono text-sm mt-1 tracking-widest">#{generatedId}</p>
          </div>
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <p className={`font-bold ${type === 'IN' ? 'text-emerald-600' : 'text-brand-red'}`}>STOCK {type}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="font-semibold text-slate-800">{formData.date}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</p>
                <p className="font-bold text-lg text-slate-800 uppercase">{formData.productName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                <p className="font-semibold text-slate-800">{formData.quantity} Units</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate</p>
                <p className="font-bold text-slate-800">₹{parseFloat(formData.carryPrice).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-50 flex gap-4 border-t">
            <button 
              onClick={() => navigate('/')} 
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
            >
              Done
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex-1 bg-brand-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-all shadow-lg"
            >
              Print Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className={`rounded-2xl shadow-xl border overflow-hidden ${
        type === 'IN' ? 'border-emerald-100' : 'border-red-100'
      }`}>
        <div className={`p-8 text-white flex items-center justify-between ${
          type === 'IN' ? 'bg-emerald-600' : 'bg-brand-red'
        }`}>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Stock {type} Entry</h1>
            <p className="text-white/80 text-sm font-medium">Add products to stock maintenance</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            {type === 'IN' ? <ArrowUpCircle size={32} className="text-white" /> : <ArrowDownCircle size={32} className="text-white" />}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-white space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} />
                Entry Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold bg-slate-50/30"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={12} />
                Party Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="customer-list"
                  value={formData.customerName}
                  placeholder="Select or type party name"
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold bg-slate-50/30"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                <datalist id="customer-list">
                  {uniqueCustomers.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} />
                Product Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="product-list"
                  value={formData.productName}
                  placeholder="Select or type product name"
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold uppercase bg-slate-50/30"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                <datalist id="product-list">
                  {inventory.map(i => (
                    <option key={i.productName} value={i.productName} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} />
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                placeholder="Units count"
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold bg-slate-50/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Weight size={12} />
                Weight (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                placeholder="0.00 kg"
                onChange={e => setFormData({...formData, weight: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold bg-slate-50/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} />
                Carry Rate (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.carryPrice}
                placeholder="Unit purchase price"
                onChange={e => setFormData({...formData, carryPrice: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none font-bold bg-slate-50/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={12} />
              Maintenance Remarks
            </label>
            <textarea
              rows={3}
              value={formData.remarks}
              placeholder="Any specific notes for this entry..."
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-red focus:outline-none resize-none font-medium bg-slate-50/30"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] ${
              type === 'IN' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' 
                : 'bg-brand-red hover:bg-red-700 shadow-red-100'
            } ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              `Save Stock ${type}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockForm;
