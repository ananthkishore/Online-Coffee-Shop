import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowLeft, AlertCircle, Sparkles, User, Phone, Home, Landmark } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    deliveryFee,
    tip,
    total,
    getCartShopId
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');

  // Guard: if cart is empty, redirect back to home
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (
      !fullName.trim() ||
      !mobileNumber.trim() ||
      !houseNo.trim() ||
      !street.trim() ||
      !area.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Phone validation
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Mobile number must be at least 10 digits.');
      return;
    }

    // Pincode validation
    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length < 6) {
      setError('Pincode must be at least 6 digits.');
      return;
    }

    const address = {
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim() || undefined
    };

    // Proceed to Payment with address state
    navigate('/payment', { state: { address } });
  };

  const getShopName = () => {
    if (cartItems.length === 0) return '';
    return cartItems[0].coffee?.shop?.name || 'Local Coffee Shop';
  };

  return (
    <div className="min-h-screen bg-coffee-50/30 pb-20">
      
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-coffee-700 hover:text-coffee-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Progress Step Header */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-bold text-coffee-500 uppercase tracking-wider">Cart</span>
          <span className="text-xs text-coffee-400">/</span>
          <span className="text-xs font-black text-coffee-950 uppercase tracking-wider border-b-2 border-coffee-600 pb-0.5">Address</span>
          <span className="text-xs text-coffee-400">/</span>
          <span className="text-xs font-bold text-coffee-400 uppercase tracking-wider">Payment</span>
        </div>

        <h1 className="text-2xl font-black text-coffee-950 mb-6 font-sans">Delivery Address</h1>

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold mb-6 max-w-2xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Address Form Section (Left side) */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-coffee-200/50 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-coffee-200/60 pb-4 mb-6">
              <h2 className="text-lg font-bold text-coffee-950 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-coffee-500" />
                Shipping & Contact Information
              </h2>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-coffee-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Johnathan Doe"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-coffee-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              {/* House/Flat No */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                  House / Flat No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-coffee-400">
                    <Home className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Flat 402, Building A"
                  />
                </div>
              </div>

              {/* Street & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. 5th Main Road"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    Area / Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Koramangala"
                  />
                </div>
              </div>

              {/* City & State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Bengaluru"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Karnataka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="8"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors text-center"
                    placeholder="e.g. 560034"
                  />
                </div>
              </div>

              {/* Landmark (optional) */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                  Landmark (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-coffee-400">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 placeholder-coffee-400 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="e.g. Near HDFC Bank ATM"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 bg-coffee-950 text-coffee-200 hover:text-white hover:bg-coffee-900 font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                Proceed to Payment
              </button>

            </form>
          </section>

          {/* Checkout Invoice Summary (Right side) */}
          <aside className="lg:col-span-5 bg-coffee-100/50 rounded-2xl border border-coffee-200/50 p-6 shadow-sm">
            <h2 className="text-base font-bold text-coffee-950 border-b border-coffee-200/60 pb-3 mb-4">
              Order Summary
            </h2>
            <div className="mb-4">
              <p className="text-[11px] text-coffee-500 font-bold uppercase tracking-wider">From Coffee Shop</p>
              <p className="font-bold text-sm text-coffee-950">{getShopName()}</p>
            </div>

            {/* List of items */}
            <ul className="divide-y divide-coffee-200/50 mb-6 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const coffee = item.coffee;
                if (!coffee) return null;
                return (
                  <li key={item._id || coffee._id} className="py-2.5 flex items-center justify-between text-xs text-coffee-800">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-coffee-950 text-[11px] bg-coffee-200 px-2 py-0.5 rounded-md">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-coffee-900">{coffee.name}</span>
                    </div>
                    <span className="font-semibold">${(coffee.price * item.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            {/* Invoicing details */}
            <div className="space-y-2 text-xs border-t border-coffee-200/60 pt-4 text-coffee-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <span>Driver Tip</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-coffee-950 border-t border-coffee-200/60 pt-3">
                <span>Total Amount Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* micro badge */}
            <div className="mt-6 flex items-center gap-2 p-3 bg-white border border-coffee-200/50 rounded-xl shadow-xs text-[10px] text-coffee-600 leading-normal">
              <Sparkles className="w-4 h-4 text-coffee-500 flex-shrink-0" />
              <span>Provide your active mobile number so that the delivery driver can contact you quickly.</span>
            </div>
          </aside>

        </div>
      </main>

    </div>
  );
};

export default Checkout;
