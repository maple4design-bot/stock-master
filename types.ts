
export type Role = 'ADMIN' | 'CUSTOMER';

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  productName: string;
  quantity: number;
  weight: number;
  carryPrice: number;
  remarks: string;
  type: TransactionType;
}

export interface InventoryItem {
  productName: string;
  totalQuantity: number;
  totalWeight: number;
  carryValue: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  password?: string;
}
