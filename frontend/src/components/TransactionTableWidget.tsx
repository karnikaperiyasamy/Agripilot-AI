import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, Clock, Truck, FileText } from 'lucide-react';

export interface TransactionRow {
  id: string;
  transactionId: string;
  name: string;
  roleBadge?: string;
  date: string;
  amount: number;
  qty: string;
  category: string;
  paymentStatus: 'PAID' | 'PENDING' | 'ESCROW';
  deliveryStatus: 'DELIVERED' | 'IN_TRANSIT' | 'PACKING';
}

interface TransactionTableWidgetProps {
  title?: string;
  transactions: TransactionRow[];
}

export const TransactionTableWidget: React.FC<TransactionTableWidgetProps> = ({
  title = "Transaction History & Commercial Ledger",
  transactions
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified blockchain & escrow ledger entries</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
            />
          </div>

          <button className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-3 w-8">
                <input type="checkbox" className="rounded text-emerald-600" />
              </th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Qty</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Payment Status</th>
              <th className="py-3 px-3">Delivery Status</th>
              <th className="py-3 px-3">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No transaction records found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <input type="checkbox" className="rounded text-emerald-600" />
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-[10px]">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <span>{item.name}</span>
                      {item.roleBadge && (
                        <span className="block text-[9px] text-slate-400 font-normal">{item.roleBadge}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-500 dark:text-slate-400">{item.date}</td>
                  <td className="py-3 px-3 font-black text-slate-900 dark:text-emerald-400">Rs. {item.amount.toLocaleString()}</td>
                  <td className="py-3 px-3 font-medium">{item.qty}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.paymentStatus === 'PAID' || item.paymentStatus === 'ESCROW'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {item.paymentStatus === 'PAID' ? 'Paid' : item.paymentStatus === 'ESCROW' ? 'Escrow Released' : 'Pending (85%)'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center space-x-1 w-fit ${
                      item.deliveryStatus === 'DELIVERED'
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : item.deliveryStatus === 'IN_TRANSIT'
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {item.deliveryStatus === 'DELIVERED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Delivered</span>
                        </>
                      ) : item.deliveryStatus === 'IN_TRANSIT' ? (
                        <>
                          <Truck className="w-3 h-3 text-blue-600" />
                          <span>In Transit</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Packing</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">{item.transactionId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
