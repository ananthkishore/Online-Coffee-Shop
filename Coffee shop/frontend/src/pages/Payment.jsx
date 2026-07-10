import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  Wallet, 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Lock,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe publishable key - Fallback to mock key if value is not a standard pk_ key (e.g. if it is an account ID acct_)
const rawPublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const isValidKey = rawPublishableKey.startsWith('pk_');
const stripePromise = loadStripe(isValidKey ? rawPublishableKey : 'pk_test_51Pzxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Stripe Card Form component
const StripeCheckoutForm = ({ total, onPaymentSuccess, onPaymentError, loading, setLoading, setPaymentStage }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setPaymentStage('verifying');

    try {
      // 1. Create Payment Intent on backend
      const response = await api.post('/payments/create-payment-intent', {
        amount: total
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId, isMock } = response.data;

      // Check if it's a simulated fallback due to placeholder keys
      if (isMock || clientSecret.startsWith('mock_')) {
        setTimeout(() => {
          setPaymentStage('success_paid');
          setTimeout(() => {
            onPaymentSuccess(paymentIntentId);
          }, 1500);
        }, 1200);
        return;
      }

      // 2. Confirm card payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        setPaymentStage('success_paid');
        setTimeout(() => {
          onPaymentSuccess(paymentIntentId);
        }, 1500);
      } else {
        throw new Error('Payment status: ' + result.paymentIntent.status);
      }
    } catch (err) {
      onPaymentError(err.message || 'An error occurred during Stripe card payment.');
      setPaymentStage('idle');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-sky-500" />
          Card Details
        </label>
        
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#1e293b',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Your card data is encrypted directly by Stripe. We do not store your credentials.</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-gradient-to-r from-sky-500 via-pink-500 to-yellow-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-pink-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Processing Payment...' : `Pay & Place Order • $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;

  const {
    cartItems,
    subtotal,
    deliveryFee,
    tip,
    total,
    getCartShopId,
    clearCart
  } = useCart();

  const [selectedMethod, setSelectedMethod] = useState('gpay'); // 'gpay', 'phonepe', 'card', 'cod'
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Secure payment stages: 'idle', 'sending_request', 'pending_approval', 'verifying', 'success_paid', 'creating_order'
  const [paymentStage, setPaymentStage] = useState('idle');
  const [paymentTimer, setPaymentTimer] = useState(180);
  const [paymentDetails, setPaymentDetails] = useState({
    methodLabel: '',
    upiId: '',
    amount: 0,
    transactionId: ''
  });
  const [showCodConfirm, setShowCodConfirm] = useState(false);

  // Guard & Stripe UPI Callback Verification Effect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const confirmUpi = queryParams.get('confirmUpi');
    const paymentIntentId = queryParams.get('payment_intent');

    if (confirmUpi && paymentIntentId) {
      const shopId = queryParams.get('shopId');
      const payMethod = queryParams.get('payMethod');
      const tipVal = Number(queryParams.get('tip')) || 0;
      const addrValStr = queryParams.get('address');
      
      let addrVal = null;
      try {
        addrVal = JSON.parse(decodeURIComponent(addrValStr));
      } catch (e) {
        console.error('Failed to parse redirected address', e);
      }

      const processRedirectedPayment = async () => {
        setPaymentStage('verifying');
        try {
          const res = await api.post('/payments/confirm', {
            paymentIntentId,
            paymentMethod: payMethod,
            amount: total
          });

          if (res.data.success) {
            setPaymentStage('success_paid');
            setTimeout(async () => {
              setPaymentStage('creating_order');
              try {
                const orderResponse = await api.post('/orders', {
                  shopId,
                  tip: tipVal,
                  address: addrVal,
                  paymentMethod: payMethod,
                  paymentStatus: 'paid',
                  transactionId: paymentIntentId
                });

                if (orderResponse.data.success) {
                  await clearCart();
                  setPaymentStage('idle');
                  navigate(`/order-success/${orderResponse.data.data._id}`);
                } else {
                  setError('Failed to create order record after payment verification.');
                  setPaymentStage('idle');
                }
              } catch (orderErr) {
                setError(orderErr.response?.data?.message || orderErr.message || 'Order creation failed');
                setPaymentStage('idle');
              }
            }, 1800);
          } else {
            setError('Payment verification returned an unsuccessful status.');
            setPaymentStage('idle');
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Failed to verify UPI payment status.');
          setPaymentStage('idle');
        }
      };

      processRedirectedPayment();
      return;
    }

    if (cartItems.length === 0) {
      navigate('/');
    } else if (!address) {
      navigate('/checkout');
    }
  }, [cartItems, address, navigate, location.search]);

  // Payment Countdown Timer Effect
  useEffect(() => {
    let interval;
    if (paymentStage === 'pending_approval' && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            setPaymentStage('idle');
            setError('Payment request timed out. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStage, paymentTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!upiId) {
      setError('Please enter a valid UPI ID (e.g. name@okaxis)');
      return;
    }

    setLoading(true);
    setPaymentStage('sending_request');
    try {
      // Create a payment intent in backend (either Stripe checkout or fallback mock check)
      const response = await api.post('/payments/create-payment-intent', {
        amount: total,
        paymentMethodType: 'upi'
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment intent generation failed');
      }

      const { paymentIntentId, clientSecret, isMock } = response.data;
      const methodLabel = selectedMethod === 'gpay' ? 'Google Pay' : 'PhonePe';

      setPaymentDetails({
        methodLabel,
        upiId,
        amount: total,
        transactionId: paymentIntentId,
        clientSecret,
        isMock
      });

      // Check if it's a simulated fallback due to placeholder keys
      if (isMock || clientSecret.startsWith('mock_')) {
        setPaymentStage('pending_approval');
        setPaymentTimer(180); // 3 minutes countdown
      } else {
        // Real Stripe UPI payment flow
        setPaymentStage('verifying');
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to initialize Stripe client library');
        }

        const confirmResult = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method_data: {
              type: 'upi',
              upi: {
                vpa: upiId
              }
            },
            return_url: `${window.location.origin}/payment?confirmUpi=true&shopId=${getCartShopId()}&tip=${tip}&payMethod=${encodeURIComponent(methodLabel)}&address=${encodeURIComponent(JSON.stringify(address))}`
          }
        });

        if (confirmResult.error) {
          throw new Error(confirmResult.error.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Payment request initiation failed. Please try again.');
      setPaymentStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = () => {
    setPaymentStage('verifying');
    setTimeout(() => {
      setPaymentStage('success_paid');
      setTimeout(async () => {
        setPaymentStage('creating_order');
        await createOrder('paid', paymentDetails.methodLabel, paymentDetails.transactionId);
      }, 1800);
    }, 1500);
  };

  const handleDeclinePayment = () => {
    setPaymentStage('idle');
    setError('Payment request was cancelled/declined by user.');
  };

  const handleCodSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowCodConfirm(true);
  };

  const onStripeSuccess = async (paymentIntentId) => {
    await createOrder('paid', 'Debit Card', paymentIntentId);
  };

  const onStripeError = (errorMessage) => {
    setError(errorMessage);
    setPaymentStage('idle');
  };

  const createOrder = async (payStatus, payMethod, transactionIdArg) => {
    setLoading(true);
    setError('');
    try {
      const shopId = getCartShopId();
      const transactionId = transactionIdArg || (payStatus === 'COD' 
        ? `cod_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        : `txn_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

      const orderResponse = await api.post('/orders', {
        shopId,
        tip,
        address,
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        transactionId
      });

      if (orderResponse.data.success) {
        const orderId = orderResponse.data.data._id;
        
        // Confirm payment status with backend if it was online payment
        if (payStatus === 'paid') {
          await api.post('/payments/confirm', {
            paymentIntentId: transactionId,
            orderId,
            paymentMethod: payMethod,
            amount: total
          });
        }

        await clearCart();
        setPaymentStage('idle');
        navigate(`/order-success/${orderId}`);
      } else {
        setError('Failed to log order record in database. Please contact support.');
        setPaymentStage('idle');
      }
    } catch (err) {
      console.error('Order processing error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
      setPaymentStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const getShopName = () => {
    if (cartItems.length === 0) return '';
    return cartItems[0].coffee?.shop?.name || 'Local Coffee Shop';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to address
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Progress Step Header */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cart</span>
          <span className="text-xs text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</span>
          <span className="text-xs text-slate-300">/</span>
          <span className="text-xs font-black text-sky-600 uppercase tracking-wider border-b-2 border-sky-600 pb-0.5">Payment</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-8 font-sans tracking-tight">Checkout Payment</h1>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold mb-6 max-w-2xl shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Payment Selection Section (Left side) */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-sky-500" />
                Select Payment Option
              </h2>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Checkout
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Payment Methods Tab System (Razorpay style) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Google Pay Tab */}
                <div 
                  onClick={() => { setSelectedMethod('gpay'); setError(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 gap-1.5 text-center ${
                    selectedMethod === 'gpay'
                      ? 'border-sky-500 bg-sky-50/30 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-bold text-xs select-none shadow-xs">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">P</span>
                    <span className="text-yellow-500">a</span>
                    <span className="text-green-500">y</span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Google Pay</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">UPI Express</p>
                  </div>
                </div>

                {/* PhonePe Tab */}
                <div 
                  onClick={() => { setSelectedMethod('phonepe'); setError(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 gap-1.5 text-center ${
                    selectedMethod === 'phonepe'
                      ? 'border-purple-500 bg-purple-50/20 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-black text-white text-[10px] select-none shadow-xs">
                    Pe
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">PhonePe</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">UPI Wallet</p>
                  </div>
                </div>

                {/* Debit Card Tab */}
                <div 
                  onClick={() => { setSelectedMethod('card'); setError(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 gap-1.5 text-center ${
                    selectedMethod === 'card'
                      ? 'border-pink-500 bg-pink-50/20 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center border border-pink-100 shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Debit Card</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Stripe Secure</p>
                  </div>
                </div>

                {/* COD Tab */}
                <div 
                  onClick={() => { setSelectedMethod('cod'); setError(''); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 gap-1.5 text-center ${
                    selectedMethod === 'cod'
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Delivery Cash</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Pay at Door</p>
                  </div>
                </div>

              </div>

              {/* Dynamic UI Content based on Selection */}
              <div className="pt-4 border-t border-slate-100">
                
                {/* GPay UPI payment layout */}
                {selectedMethod === 'gpay' && (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div className="bg-sky-50/30 border border-sky-100 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                        <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">GPay Instant Pay</h4>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Enter UPI Address / VPA</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. mobileNumber@okaxis"
                            className="flex-grow px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50/10"
                          />
                          <button 
                            type="button"
                            onClick={() => setUpiId(`${user?.phone || '9999900000'}@okaxis`)}
                            className="px-3 text-xs font-bold text-sky-600 bg-sky-100/50 hover:bg-sky-100 rounded-xl border border-sky-200/30 transition-all"
                          >
                            Use autofill
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Requesting UPI Authorization...' : `Pay via Google Pay • $${total.toFixed(2)}`}
                    </button>
                  </form>
                )}

                {/* PhonePe UPI payment layout */}
                {selectedMethod === 'phonepe' && (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div className="bg-purple-50/20 border border-purple-100 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
                        <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">PhonePe Express</h4>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Enter PhonePe UPI ID</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. name@ybl"
                            className="flex-grow px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-purple-500 focus:bg-purple-50/10"
                          />
                          <button 
                            type="button"
                            onClick={() => setUpiId(`${user?.phone || '9999900000'}@ybl`)}
                            className="px-3 text-xs font-bold text-purple-600 bg-purple-100/50 hover:bg-purple-100 rounded-xl border border-purple-200/30 transition-all"
                          >
                            Use autofill
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Connecting with PhonePe App...' : `Pay via PhonePe • $${total.toFixed(2)}`}
                    </button>
                  </form>
                )}

                {/* Stripe Debit/Credit Card layout */}
                {selectedMethod === 'card' && (
                  <Elements stripe={stripePromise}>
                    <StripeCheckoutForm 
                      total={total}
                      onPaymentSuccess={onStripeSuccess}
                      onPaymentError={onStripeError}
                      loading={loading}
                      setLoading={setLoading}
                      setPaymentStage={setPaymentStage}
                    />
                  </Elements>
                )}

                {/* Cash on Delivery Layout */}
                {selectedMethod === 'cod' && (
                  <form onSubmit={handleCodSubmit} className="space-y-6">
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 text-center space-y-1">
                      <p className="text-sm font-semibold text-emerald-800">You will pay on delivery</p>
                      <p className="text-xs text-emerald-600">Please prepare physical cash or UPI scan at delivery completion.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:bg-slate-800 transition-all duration-200 active:scale-[0.98] disabled:bg-slate-300"
                    >
                      Place Order (COD) • ${total.toFixed(2)}
                    </button>
                  </form>
                )}

              </div>

            </div>
          </section>

          {/* Checkout Invoice Summary (Right side) */}
          <aside className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-200/60 pb-3 mb-4">
              Order Summary
            </h2>
            <div className="mb-4">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">From Coffee Shop</p>
              <p className="font-bold text-sm text-slate-800">{getShopName()}</p>
            </div>

            {/* List of items */}
            <ul className="divide-y divide-slate-200/60 mb-6 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const coffee = item.coffee;
                if (!coffee) return null;
                return (
                  <li key={item._id || coffee._id} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-700 text-[11px] bg-slate-200 px-2 py-0.5 rounded-md">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-slate-800">{coffee.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">${(coffee.price * item.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            {/* Delivery address details preview */}
            {address && (
              <div className="mb-6 p-3.5 bg-white border border-slate-200/60 rounded-xl text-xs text-slate-700 shadow-sm">
                <p className="font-bold text-slate-800 mb-1">Delivery Address:</p>
                <p className="font-semibold">{address.fullName} ({address.mobileNumber})</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  {address.houseNo}, {address.street}, {address.area}, {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            )}

            {/* Invoicing details */}
            <div className="space-y-2.5 text-xs border-t border-slate-200/60 pt-4 text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery Fee</span>
                <span className="font-medium text-slate-800">${deliveryFee.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <span>Driver Tip</span>
                  <span className="font-medium text-slate-800">${tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200/60 pt-3">
                <span>Total Amount Due</span>
                <span className="text-sky-600 font-extrabold">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Micro details badge */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm text-[10px] text-slate-500 leading-normal">
              <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
              <span>Payments are processed securely via live Stripe API integration checks. No actual funds are charged during test mode operations.</span>
            </div>
          </aside>

        </div>
      </main>

      {/* Simulated UPI & Secure Card Payment Overlay Modal */}
      {paymentStage !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 transform scale-100">
            
            {/* Top Close Button (only active if not in crucial processing stages) */}
            {['pending_approval'].includes(paymentStage) && (
              <button 
                onClick={handleDeclinePayment}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* STAGE 1: Sending payment request */}
            {paymentStage === 'sending_request' && (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="w-14 h-14 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
                <h3 className="text-lg font-bold text-slate-900">Initiating Payment Request</h3>
                <p className="text-sm text-slate-500">Creating a secure payment session and generating your UPI transaction link...</p>
              </div>
            )}

            {/* STAGE 2: Awaiting User Approval on UPI App */}
            {paymentStage === 'pending_approval' && (
              <div className="space-y-6">
                {/* Simulated Push Notification Header */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500 text-white rounded-lg">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400">Payment Request Received</p>
                      <p className="text-sm font-extrabold truncate">
                        {paymentDetails.methodLabel}: Approve pay request of ${paymentDetails.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Awaiting App Approval</h3>
                  <p className="text-xs text-slate-500">
                    A payment request has been sent to your UPI address:
                  </p>
                  <span className="inline-block bg-slate-100 text-slate-800 font-mono text-sm px-3 py-1 rounded-full font-bold">
                    {paymentDetails.upiId}
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Time</p>
                  <div className="text-3xl font-black text-sky-600 tracking-wider">
                    {formatTimer(paymentTimer)}
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-1000"
                      style={{ width: `${(paymentTimer / 180) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                  <span>Please approve the payment notification in your UPI app.</span>
                </div>

                {/* Simulation Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <button
                    onClick={handleApprovePayment}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve & Pay ${paymentDetails.amount.toFixed(2)}
                  </button>
                  <button
                    onClick={handleDeclinePayment}
                    className="w-full py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold rounded-xl transition-all"
                  >
                    Decline Request
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Verifying */}
            {paymentStage === 'verifying' && (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <h3 className="text-lg font-bold text-slate-900">Verifying Payment</h3>
                <p className="text-sm text-slate-500">Retrieving approval status from banking network. Please do not close or navigate away.</p>
              </div>
            )}

            {/* STAGE 4: Success Paid */}
            {paymentStage === 'success_paid' && (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Payment Success</h3>
                <p className="text-sm text-emerald-600 font-semibold">Funds received successfully. Preparing your order details...</p>
              </div>
            )}

            {/* STAGE 5: Creating Order */}
            {paymentStage === 'creating_order' && (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <h3 className="text-lg font-bold text-slate-900">Creating Your Order</h3>
                <p className="text-sm text-slate-500">Registering order in merchant dashboard & preparing fresh coffee queue...</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Cash On Delivery Confirmation Modal */}
      {showCodConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-2xl p-6 max-w-sm w-full text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Confirm Order</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to place this order using Cash on Delivery? You will need to pay $<b>{total.toFixed(2)}</b> to the driver at your door.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCodConfirm(false)}
                className="flex-1 py-3 text-slate-500 hover:text-slate-800 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
              >
                Go Back
              </button>
              <button
                onClick={confirmCodOrder}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-md transition-all text-xs"
              >
                Yes, Place Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payment;

