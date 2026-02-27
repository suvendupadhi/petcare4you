import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentService, stripeService, Payment } from '../services/petCare4YouService';
import { useToast } from '../context/ToastContext';

// Initialize stripe
const stripePromise = loadStripe('pk_test_placeholder'); // Replace with your key

interface PaymentModalProps {
  payment: Payment;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutForm = ({ payment, onSuccess }: { payment: Payment, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const getIntent = async () => {
      try {
        const data = await stripeService.createPaymentIntent(payment.id);
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment');
      }
    };
    getIntent();
  }, [payment.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: `${payment.appointment?.owner?.firstName} ${payment.appointment?.owner?.lastName}`,
        },
      },
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${payment.amount}`}
      </button>
    </form>
  );
};

export default function PaymentModal({ payment, onClose, onSuccess }: PaymentModalProps) {
  const { showToast } = useToast();
  const [method, setMethod] = useState<'selection' | 'card' | 'cash'>('selection');
  const [cashAmount, setCashAmount] = useState(payment.amount.toString());
  const [loading, setLoading] = useState(false);

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      await paymentService.payCash(payment.id, parseFloat(cashAmount));
      showToast('Cash payment recorded successfully', 'success');
      onSuccess();
    } catch (error) {
      showToast('Failed to record cash payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Complete Payment</h3>
            <p className="text-xs text-slate-500 font-medium">Invoice #{payment.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-slate-100 cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {method === 'selection' && (
            <div className="space-y-4">
              <p className="text-slate-600 font-medium text-center">How would you like to pay?</p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setMethod('card')}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50/50 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <CreditCard size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Pay with Card</div>
                    <div className="text-xs text-slate-500">Secure Stripe payment</div>
                  </div>
                </button>

                <button 
                  onClick={() => setMethod('cash')}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50/50 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <DollarSign size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Pay with Cash</div>
                    <div className="text-xs text-slate-500">Direct physical payment</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4">
              <button onClick={() => setMethod('selection')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer">← Change Method</button>
              <Elements stripe={stripePromise}>
                <CheckoutForm payment={payment} onSuccess={onSuccess} />
              </Elements>
            </div>
          )}

          {method === 'cash' && (
            <div className="space-y-6">
              <button onClick={() => setMethod('selection')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer">← Change Method</button>
              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount to Collect</div>
                  <div className="text-4xl font-black text-slate-900">${payment.amount}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Confirm Received Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                    <input 
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCashPayment}
                  disabled={loading || parseFloat(cashAmount) <= 0}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Confirm Cash Received'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
