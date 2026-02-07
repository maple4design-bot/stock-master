
import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar,
  FileSpreadsheet,
  MessageSquare,
  Printer,
  User as UserIcon,
  ChevronDown,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
}

type SortField = 'date' | 'quantity' | 'weight' | 'carryPrice';
type SortOrder = 'asc' | 'desc';

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [filterCustomer, setFilterCustomer] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const uniqueCustomers = useMemo(() => {
    const customers = Array.from(new Set(transactions.map(tx => tx.customerName)));
    return customers.sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.remarks.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesCustomer = filterCustomer === 'ALL' || tx.customerName === filterCustomer;
      
      const txDate = new Date(tx.date);
      const matchesStartDate = !startDate || txDate >= new Date(startDate);
      const matchesEndDate = !endDate || txDate <= new Date(endDate);
      
      return matchesSearch && matchesType && matchesCustomer && matchesStartDate && matchesEndDate;
    });
  }, [transactions, searchTerm, filterType, filterCustomer, startDate, endDate]);

  const sortedTransactions = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterCustomer('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm !== '' || filterType !== 'ALL' || filterCustomer !== 'ALL' || startDate !== '' || endDate !== '';

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="ml-1 text-brand-red" /> : <ArrowDown size={12} className="ml-1 text-brand-red" />;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Stock Logs</h1>
          <p className="text-slate-500 font-medium">Historical audit of all stock maintenance movements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <FileSpreadsheet size={16} />
            Export Data
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <Printer size={16} />
            Print Ledger
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex flex-col gap-5 shadow-sm no-print">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Filter by product, customer or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-100 focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red focus:outline-none transition-all font-bold text-slate-800 text-sm bg-slate-50/50 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 relative group">
              <UserIcon size={16} className="ml-2 text-slate-400" />
              <input
                type="text"
                list="customer-filter-list"
                value={filterCustomer === 'ALL' ? '' : filterCustomer}
                placeholder="All Parties"
                onChange={(e) => setFilterCustomer(e.target.value || 'ALL')}
                className="bg-transparent border-none text-[11px] focus:ring-0 text-slate-800 font-black uppercase tracking-widest cursor-pointer py-1.5 w-32 md:w-40 placeholder:text-slate-400"
              />
              <ChevronDown size={14} className="mr-2 text-slate-300 pointer-events-none" />
              <datalist id="customer-filter-list">
                <option value="ALL">All Parties</option>
                {uniqueCustomers.map(cust => (
                  <option key={cust} value={cust}>{cust}</option>
                ))}
              </datalist>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 px-3">
                <Calendar size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] focus:ring-0 text-slate-800 font-black cursor-pointer uppercase tracking-widest"
                />
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-2 px-3">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] focus:ring-0 text-slate-800 font-black cursor-pointer uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {['ALL', 'IN', 'OUT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as any)}
                  className={`px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    filterType === t 
                      ? 'bg-white text-brand-red shadow-sm border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-brand-red font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <FilterX size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th 
                  className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center">
                    Timestamp
                    <SortIndicator field="date" />
                  </div>
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset/Party</th>
                <th 
                  className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => toggleSort('quantity')}
                >
                  <div className="flex items-center justify-center">
                    Qty IN/OUT
                    <SortIndicator field="quantity" />
                  </div>
                </th>
                <th 
                  className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => toggleSort('weight')}
                >
                  <div className="flex items-center justify-center">
                    Weight
                    <SortIndicator field="weight" />
                  </div>
                </th>
                <th 
                  className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => toggleSort('carryPrice')}
                >
                  <div className="flex items-center justify-end">
                    Unit Rate
                    <SortIndicator field="carryPrice" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm ${tx.type === 'IN' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-brand-red shadow-red-100'}`}></div>
                      <span className="font-black text-slate-800 text-sm uppercase tracking-tight group-hover:text-brand-red transition-colors">{tx.productName}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 ml-[26px] uppercase tracking-widest mt-1">
                      {tx.customerName}
                    </div>
                    {tx.remarks && (
                      <div className="text-[10px] text-slate-400 mt-2 ml-[26px] italic font-medium flex items-center gap-2">
                        <MessageSquare size={12} className="text-slate-300 shrink-0" />
                        <span className="truncate max-w-[200px]">{tx.remarks}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="space-y-1">
                      <div className={`text-sm font-black ${tx.type === 'IN' ? 'text-emerald-600' : 'text-brand-red'}`}>
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {tx.type} QTY
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-slate-800">
                        {tx.weight > 0 ? tx.weight.toLocaleString() : '0.00'}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        KG
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-mono text-sm text-slate-800 font-black">₹{tx.carryPrice.toLocaleString()}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mt-1">{tx.type} RATE</div>
                  </td>
                </tr>
              ))}
              {sortedTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <History size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching historical logs</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
