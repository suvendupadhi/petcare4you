import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, ExternalLink, Filter, Calendar, User, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { paymentService, Payment, RevenueSummary } from '../services/petCareService';
import PaymentModal from '../components/PaymentModal';

export default function PaymentInvoicePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInvoice = async (paymentId: number) => {
    setInvoiceLoading(paymentId);
    try {
      const blob = await paymentService.getInvoice(paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate invoice');
    } finally {
      setInvoiceLoading(null);
    }
  };

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    loadData(); // Refresh totals and list
    alert('Payment successful!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      <p className="text-slate-500 font-bold">Loading financial records...</p>
    </div>
  );

  return (
    <Layout userType="provider">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments & Invoices 💼</h1>
            <p className="text-slate-500">Track your business earnings and manage client billing.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm uppercase tracking-widest">
            <Calendar size={14} className="text-orange-600" />
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryCard 
            label="Total Earnings" 
            value={`$${revenue?.totalRevenue || 0}`} 
            color="text-green-600"
            bgColor="bg-green-50"
            icon={<DollarSign size={20} />}
          />
          <SummaryCard 
            label="Total Transactions" 
            value={payments.filter(p => p.status === 6).length.toString()} 
            color="text-blue-600"
            bgColor="bg-blue-50"
            icon={<CreditCard size={20} />}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Showing all completed service records.</p>
            </div>
            <div className="flex items-center gap-3">
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Time</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.filter(p => p.status === 6).length > 0 ? payments.filter(p => p.status === 6).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{new Date(pay.appointment?.appointmentDate || pay.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #{pay.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                          {pay.appointment?.owner?.firstName[0]}{pay.appointment?.owner?.lastName[0]}
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {pay.appointment?.owner?.firstName} {pay.appointment?.owner?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-lg w-fit">
                        <Clock size={14} className="text-slate-400" />
                        {pay.appointment?.startTime ? new Date(pay.appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-slate-900">${pay.amount}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleGenerateInvoice(pay.id)}
                          disabled={invoiceLoading === pay.id}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                        >
                          {invoiceLoading === pay.id ? (
                            <div className="animate-spin h-3 w-3 border-b-2 border-orange-600 rounded-full" />
                          ) : (
                            <FileText size={14} />
                          )}
                          Invoice
                        </button>
                        
                        {pay.status === 6 ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={14} />
                            Paid
                          </div>
                        ) : (
                          <button 
                            onClick={() => openPaymentModal(pay)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-xs font-bold text-white hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20"
                          >
                            <DollarSign size={14} />
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-4">
                        <FileText size={48} className="opacity-10" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-600">No transactions yet</p>
                          <p className="text-xs font-medium">Complete appointments will appear here for billing.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPayment && (
        <PaymentModal 
          payment={selectedPayment} 
          onClose={() => { setShowPaymentModal(false); setSelectedPayment(null); }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Layout>
  );
}

function SummaryCard({ label, value, color, bgColor, icon }: { label: string, value: string, color: string, bgColor: string, icon: any }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-3 ${bgColor} rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-black ${color} tracking-tight`}>{value}</div>
    </div>
  );
}
