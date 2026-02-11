import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, ExternalLink, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { paymentService, Payment, RevenueSummary } from '../services/petCareService';

export default function PaymentInvoicePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [payData, revData] = await Promise.all([
          paymentService.getProviderPayments(),
          paymentService.getRevenueSummary()
        ]);
        setPayments(payData);
        setRevenue(revData);
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading financial data...</div>;

  return (
    <Layout userType="provider">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Invoices</h1>
          <p className="text-slate-500">Track your earnings and manage your financial records.</p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard 
            label="Total Earnings" 
            value={`$${revenue?.totalRevenue || 0}`} 
            color="text-green-600"
            icon={<DollarSign size={20} />}
          />
          <SummaryCard 
            label="Pending Payouts" 
            value={`$${revenue?.pendingRevenue || 0}`} 
            color="text-orange-600"
            icon={<CreditCard size={20} />}
          />
          <SummaryCard 
            label="Invoices Sent" 
            value={payments.length.toString()} 
            color="text-blue-600"
            icon={<ExternalLink size={20} />}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Transaction History</h2>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length > 0 ? payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{pay.transactionId?.slice(-8) || pay.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{pay.appointment?.owner?.firstName} {pay.appointment?.owner?.lastName}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">${pay.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                        pay.status === 2 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {pay.status === 2 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string, value: string, color: string, icon: any }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 bg-slate-50 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
