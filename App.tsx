
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Transaction, InventoryItem, User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockForm from './pages/StockForm';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import CustomerReport from './pages/CustomerReport';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('stock_users_list');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', name: 'admin', password: 'admin', role: 'ADMIN' }];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('stock_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stock_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('stock_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('stock_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('stock_user');
    }
  }, [currentUser]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const inventoryItems = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTxs.forEach(tx => {
      const existing = map.get(tx.productName) || {
        productName: tx.productName,
        totalQuantity: 0,
        totalWeight: 0,
        carryValue: 0,
      };

      if (tx.type === 'IN') {
        const totalOldVal = existing.totalQuantity * existing.carryValue;
        const newVal = tx.quantity * tx.carryPrice;
        existing.totalQuantity += tx.quantity;
        existing.totalWeight += (tx.weight || 0);
        existing.carryValue = existing.totalQuantity > 0 ? (totalOldVal + newVal) / existing.totalQuantity : tx.carryPrice;
      } else {
        existing.totalQuantity -= tx.quantity;
        existing.totalWeight -= (tx.weight || 0);
      }
      map.set(tx.productName, existing);
    });

    return Array.from(map.values());
  }, [transactions]);

  if (!currentUser) {
    return <Login users={users} onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <HashRouter>
      <Layout user={currentUser} onLogout={() => setCurrentUser(null)}>
        <Routes>
          <Route path="/" element={<Dashboard transactions={transactions} inventory={inventoryItems} user={currentUser} />} />
          <Route path="/stock-in" element={<StockForm type="IN" user={currentUser} onAdd={handleAddTransaction} inventory={inventoryItems} transactions={transactions} />} />
          <Route path="/stock-out" element={<StockForm type="OUT" user={currentUser} onAdd={handleAddTransaction} inventory={inventoryItems} transactions={transactions} />} />
          <Route path="/transactions" element={<Transactions transactions={transactions} />} />
          <Route path="/customer-report" element={<CustomerReport transactions={transactions} />} />
          <Route 
            path="/users" 
            element={currentUser.role === 'ADMIN' ? <Users users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} /> : <Navigate to="/" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
