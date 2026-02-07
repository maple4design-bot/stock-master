
import React, { useState, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  ChevronRight, 
  X, 
  History, 
  Calendar, 
  Activity,
  // Added missing Info icon import
  Info
} from 'lucide-react';
import { Transaction, InventoryItem, User } from '../types';
import GeminiInsights from '../components/GeminiInsights';

interface DashboardProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, inventory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  const lowStockItems = inventory.filter(item => item.totalQuantity < 10 && item.totalQuantity > 0);
  const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.quantity, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.quantity, 0);
  const netBalance = totalIn - totalOut;

  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventory;
    const q = searchTerm.toLowerCase();
    return inventory.filter(i => i.productName.toLowerCase().includes(q));
  }, [inventory, searchTerm]);

  const productDetails = useMemo(() => {
    if (!selectedProduct) return null;
    
    const productItem = inventory.find(i => i.productName === selectedProduct);
    const productTxs = transactions
      .filter(tx => tx.productName === selectedProduct)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let pricePoints = transactions
      .filter(tx => tx.productName === selectedProduct && tx.type === 'IN')
      .sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime())
      .map(tx => ({
        date: new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        price: tx.carryPrice,
      }));

    const isUsingDummy = pricePoints.length < 3;
    if (isUsingDummy) {
      const basePrice = productItem?.carryValue || 100;
      const now = new Date();
      const dummyData = [];
      for (let i = 4; i > 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - (i * 7));
        dummyData.push({
          date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          price: Number((basePrice * (0.95 + Math.random() * 0.1)).toFixed(2)),
        });
      }
      pricePoints = [...dummyData, ...pricePoints];
    }

    return {
      item: productItem,
      history: productTxs,
      priceTrend: pricePoints,
      isUsingDummy
    };
  }, [selectedProduct, inventory, transactions]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Dashboard</h1>
          <p className="text-slate-500 font-medium">Stock Maintenance Overview for {user.name}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Package size={24} />
            </div>
            {lowStockItems.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 rounded-lg">
                <AlertTriangle size={12} />
                {lowStockItems.length} Low
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Products</p>
          <p className="text-2xl font-black text-slate-800">{inventory.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowUpCircle size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Qty Received (IN)</p>
          <p className="text-2xl font-black text-slate-800">{totalIn.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <ArrowDownCircle size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Qty Issued (OUT)</p>
          <p className="text-2xl font-black text-slate-800">{totalOut.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Remaining Stock</p>
          <p className="text-2xl font-black text-slate-800">{netBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stock Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Live Stock Balance</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Find product..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-red/20 w-48"
              />
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Stock</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carry Value (Unit)</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInventory.slice(0, 15).map(item => (
                  <tr 
                    key={item.productName} 
                    onClick={() => setSelectedProduct(item.productName)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 text-sm font-black text-slate-800 uppercase tracking-tight">{item.productName}</td>
                    <td className="py-4 text-sm font-bold text-slate-600">{item.totalQuantity.toLocaleString()} Units</td>
                    <td className="py-4 text-sm text-emerald-600 font-mono font-bold">₹{item.carryValue.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <ChevronRight size={16} className="inline text-slate-300 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-bold">No products in maintenance log.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gemini Insights Section */}
        <div className="lg:col-span-1">
          <GeminiInsights inventory={inventory} transactions={transactions} />
        </div>
      </div>

      {/* Product Detail Sidebar */}
      {selectedProduct && productDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l">
            <div className="border-b px-8 py-6 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center text-white shadow-xl">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{selectedProduct}</h2>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Product Stock Analytics</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-brand-red transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining Stock</p>
                  <p className="text-xl font-black text-slate-800">{productDetails.item?.totalQuantity.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Weight</p>
                  <p className="text-xl font-black text-slate-800">{productDetails.item?.totalWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carry Value (Unit)</p>
                  <p className="text-xl font-black text-emerald-600">₹{productDetails.item?.carryValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Price Trend Chart Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-red" />
                    <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-wider">Carry Value Trend</h3>
                  </div>
                  {/* Fixed typo: isUsing dummy to isUsingDummy */}
                  {productDetails.isUsingDummy && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest border border-blue-100">
                      <Info size={10} /> Trend Projection
                    </div>
                  )}
                </div>
                
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productDetails.priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold'}}
                        formatter={(value: any) => [`₹${value}`, 'Carry Value']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#E31E24" 
                        fill="#E31E24"
                        fillOpacity={0.1}
                        strokeWidth={3} 
                        dot={{fill: '#E31E24', r: 3, strokeWidth: 0}} 
                        activeDot={{r: 5, strokeWidth: 2, stroke: '#fff'}}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-slate-400" />
                    <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-wider">Movement History</h3>
                  </div>
                  <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">
                    {productDetails.history.length} Logs
                  </span>
                </div>
                <div className="space-y-2">
                  {productDetails.history.map(tx => (
                    <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[9px] ${
                          tx.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-brand-red'
                        }`}>
                          {tx.type}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{tx.customerName}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                            <Calendar size={10} />
                            {new Date(tx.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black ${tx.type === 'IN' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {tx.type === 'IN' ? '+' : '-'}{tx.quantity.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Carry: ₹{tx.carryPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Close Data Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
