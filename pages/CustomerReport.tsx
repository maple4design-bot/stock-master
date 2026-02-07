
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  Download,
  Users,
  MessageSquare,
  ListOrdered,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { Transaction } from '../types';

interface CustomerReportProps {
  transactions: Transaction[];
}

interface CustomerSummary {
  name: string;
  totalInQty: number;
  totalOutQty: number;
  lastActivity: string;
  transactionCount: number;
}

const CustomerReport: React.FC<CustomerReportProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const matchesStart = !startDate || txDate >= new Date(startDate);
      const matchesEnd = !endDate || txDate <= new Date(endDate);
      return matchesStart && matchesEnd;
    });
  }, [transactions, startDate, endDate]);

  const customerSummaries = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    dateFilteredTransactions.forEach(tx => {
      const existing = map.get(tx.customerName) || {
        name: tx.customerName,
        totalInQty: 0,
        totalOutQty: 0,
        lastActivity: tx.date,
        transactionCount: 0
      };

      if (tx.type === 'IN') {
        existing.totalInQty += tx.quantity;
      } else {
        existing.totalOutQty += tx.quantity;
      }

      if (new Date(tx.date) > new Date(existing.lastActivity)) {
        existing.lastActivity = tx.date;
      }
      
      existing.transactionCount += 1;
      map.set(tx.customerName, existing);
    });

    return Array.from(map.values()).filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.transactionCount - a.transactionCount);
  }, [dateFilteredTransactions, searchTerm]);

  const drillDownData = useMemo(() => {
    if (!selectedCustomer) return [];
    return dateFilteredTransactions
      .filter(tx => tx.customerName === selectedCustomer)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, dateFilteredTransactions]);

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Total Qty Received (IN)', 'Total Qty Issued (OUT)', 'Transactions Count', 'Net Qty Balance'];
    const rows = customerSummaries.map(s => [
      `"${s.name}"`,
      s.totalInQty,
      s.totalOutQty,
      s.transactionCount,
      s.totalInQty - s.totalOutQty
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer_qty_report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleExportCustomerDetailsCSV = () => {
    if (!selectedCustomer || drillDownData.length === 0) return;

    const headers = ['Date', 'Product', 'Type', 'Quantity', 'Carry Rate (INR)', 'Remarks'];
    const rows = drillDownData.map(tx => [
      tx.date,
      `"${tx.productName.replace(/"/g, '""')}"`,
      tx.type,
      tx.quantity,
      tx.carryPrice,
      `"${tx.remarks.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCustomer.replace(/\s+/g, '_')}_detailed_qty_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Party Stock Summary</h1>
          <p className="text-slate-500 font-medium">Customer-wise analysis of Quantity IN and OUT.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-[10px] uppercase tracking-widest"
          >
            <Download size={14} />
            CSV Export
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg text-[10px] uppercase tracking-widest"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-brand-red">
            <Users size={20} />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Total Unique Parties</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{customerSummaries.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <ArrowDownLeft size={20} />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Total Received (IN)</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {customerSummaries.reduce((a, b) => a + b.totalInQty, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-brand-red">
            <ArrowUpRight size={20} />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Total Issued (OUT)</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {customerSummaries.reduce((a, b) => a + b.totalOutQty, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <Activity size={20} />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Net Movement Bal</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {(customerSummaries.reduce((a, b) => a + b.totalInQty, 0) - customerSummaries.reduce((a, b) => a + b.totalOutQty, 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col lg:flex-row gap-4 shadow-sm no-print">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search party name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-50 focus:ring-2 focus:ring-brand-red focus:outline-none transition-all font-bold text-sm bg-slate-50/50"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <Calendar size={14} className="ml-2 text-slate-400" />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none text-[10px] focus:ring-0 text-slate-600 font-bold"
          />
          <span className="text-slate-300">|</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none text-[10px] focus:ring-0 text-slate-600 font-bold mr-2"
          />
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Party / Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Received (IN)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Issued (OUT)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Logs</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Qty Bal</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerSummaries.map((summary) => (
                <tr 
                  key={summary.name} 
                  onClick={() => setSelectedCustomer(summary.name)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 uppercase text-sm tracking-tight">{summary.name}</div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Last Activity: {new Date(summary.lastActivity).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-black">
                      {summary.totalInQty.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 bg-red-50 text-brand-red rounded-lg text-sm font-black">
                      {summary.totalOutQty.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500">
                      <ListOrdered size={12} className="text-slate-300" />
                      <span className="text-sm font-bold font-mono">{summary.transactionCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className={`font-black text-sm ${summary.totalInQty - summary.totalOutQty < 0 ? 'text-brand-red' : 'text-slate-800'}`}>
                      {(summary.totalInQty - summary.totalOutQty).toLocaleString()} Units
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right no-print">
                    <ChevronRight className="inline-block text-slate-300 group-hover:text-brand-red transition-all" />
                  </td>
                </tr>
              ))}
              {customerSummaries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No activity logs found for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill Down Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
          <div className="relative bg-slate-50 h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="bg-white border-b p-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{selectedCustomer}</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Party Specific Stock Ledger</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportCustomerDetailsCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-[9px] font-black uppercase tracking-widest border border-emerald-100"
                  title="Export this customer's log"
                >
                  <FileSpreadsheet size={14} />
                  Download Detailed CSV
                </button>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-brand-red"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-3">
              {drillDownData.map((tx) => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{tx.productName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{tx.date}</p>
                    {tx.remarks && <p className="text-[9px] text-slate-400 italic mt-1 flex items-center gap-1"><MessageSquare size={10} /> {tx.remarks}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === 'IN' ? 'text-emerald-600' : 'text-brand-red'}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity} units
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Carry Rate: ₹{tx.carryPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 border-t">
              <button onClick={() => setSelectedCustomer(null)} className="w-full bg-brand-dark text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">Close Party Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReport;
