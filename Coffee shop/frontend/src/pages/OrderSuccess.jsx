import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Clock, ShoppingBag, MapPin, Truck, RefreshCw, ChevronRight } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order status:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll order status every 5 seconds while order is not delivered
  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      if (pollingActive && order?.orderStatus !== 'delivered') {
        fetchOrder();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, pollingActive, order?.orderStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50/40 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-coffee-700">Loading order tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-coffee-50/40 flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-xl font-bold text-coffee-950">Order Tracker Error</h3>
        <p className="text-sm text-coffee-500 mt-2">Could not find or retrieve details for this order.</p>
        <Link to="/" className="mt-6 bg-coffee-950 text-coffee-100 font-bold px-6 py-2 rounded-xl text-sm">
          Go back home
        </Link>
      </div>
    );
  }

  // Tracking step definitions
  const steps = [
    { key: 'pending', label: 'Pending', desc: 'Awaiting shop review' },
    { key: 'received', label: 'Received', desc: 'Barista preparing your order' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'Awaiting driver claim' },
    { key: 'accepted', label: 'Accepted', desc: 'Driver assigned to order' },
    { key: 'picked_up', label: 'Picked Up', desc: 'Driver is on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Order arrived! Enjoy!' }
  ];

  // Helper to determine active step indexes
  const getStatusIndex = (status) => {
    return steps.findIndex(step => step.key === status);
  };

  const activeIndex = getStatusIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-coffee-50/40 pb-20">
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Success Header */}
        <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 sm:p-8 text-center shadow-sm max-w-2xl mx-auto mb-8">
          <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-coffee-950">Thank You For Your Order!</h1>
          <p className="text-sm text-coffee-600 mt-2">
            Your transaction has been authorized successfully and your coffee order is logged.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-coffee-100/50 border border-coffee-200/50 px-4 py-2 rounded-xl text-xs font-bold text-coffee-800">
            <span>Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
            <span>•</span>
            <span className="capitalize">Status: {order.orderStatus.replace('_', ' ')}</span>
          </div>
        </section>

        {/* Live Status Tracker Timeline */}
        <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between border-b border-coffee-200/50 pb-4 mb-8">
            <h2 className="text-lg font-bold text-coffee-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-coffee-500" />
              Live Delivery Status
            </h2>
            <button
              onClick={fetchOrder}
              className="flex items-center gap-1.5 text-xs font-bold text-coffee-700 hover:text-coffee-950 border border-coffee-300 rounded-lg px-2.5 py-1 hover:bg-coffee-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Stepper Timeline (Vertical for mobile, Horizontal for desktop) */}
          <div className="relative">
            <div className="hidden md:flex justify-between items-start relative">
              
              {/* Connector line background */}
              <div className="absolute top-5 left-10 right-10 h-1 bg-coffee-100 -z-10 rounded-full"></div>
              
              {/* Connector line filled progress */}
              <div
                className="absolute top-5 left-10 h-1 bg-coffee-500 -z-10 rounded-full transition-all duration-500"
                style={{ width: `${(activeIndex / (steps.length - 1)) * 83.33}%` }}
              ></div>

              {steps.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;
                const isUpcoming = idx > activeIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center flex-1 px-2">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-xs transition-all duration-300 ${
                        isCompleted
                          ? 'bg-coffee-500 text-coffee-950 border-coffee-600 shadow-sm'
                          : isActive
                          ? 'bg-coffee-950 text-coffee-200 border-coffee-950 animate-pulse-soft shadow-md'
                          : 'bg-white text-coffee-400 border-coffee-200'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className={`text-xs font-bold mt-3 ${isActive ? 'text-coffee-950 text-sm' : 'text-coffee-800'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-coffee-400 mt-0.5 max-w-[120px] leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Vertical timeline for smaller screens */}
            <div className="md:hidden space-y-6 pl-4 border-l-2 border-coffee-200/80 relative">
              {steps.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;

                return (
                  <div key={step.key} className="relative pl-6">
                    {/* Left node indicator */}
                    <div
                      className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-coffee-500 text-coffee-950 border-coffee-600'
                          : isActive
                          ? 'bg-coffee-950 text-coffee-200 border-coffee-950 animate-pulse-soft'
                          : 'bg-white text-coffee-400 border-coffee-200'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isActive ? 'text-coffee-950 text-sm' : 'text-coffee-800'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-coffee-500 leading-snug mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Courier, Shop & Customer Address info details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Shop information card */}
          <section className="bg-white rounded-2xl border border-coffee-200/50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-coffee-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coffee-400" />
              Pickup Shop Details
            </h3>
            <div className="space-y-2.5 text-xs text-coffee-800">
              <p className="font-extrabold text-sm text-coffee-950">{order.shop.name}</p>
              <p><span className="font-semibold text-coffee-500">Address:</span> {order.shop.address}</p>
              <p><span className="font-semibold text-coffee-500">Phone:</span> {order.shop.phone}</p>
            </div>
          </section>

          {/* Delivery Address card */}
          <section className="bg-white rounded-2xl border border-coffee-200/50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-coffee-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coffee-400" />
              Delivery Address
            </h3>
            <div className="space-y-2.5 text-xs text-coffee-800">
              {order.address ? (
                <>
                  <p className="font-extrabold text-sm text-coffee-950">{order.address.fullName}</p>
                  <p><span className="font-semibold text-coffee-500">Phone:</span> {order.address.mobileNumber}</p>
                  <p className="text-coffee-600 mt-0.5">
                    {order.address.houseNo}, {order.address.street}, {order.address.area}<br />
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                    {order.address.landmark && <><br /><span className="text-coffee-400">Landmark: {order.address.landmark}</span></>}
                  </p>
                </>
              ) : (
                <p className="text-coffee-500 italic">No delivery address saved.</p>
              )}
            </div>
          </section>

          {/* Courier supplier card */}
          <section className="bg-white rounded-2xl border border-coffee-200/50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-coffee-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-coffee-400" />
              Delivery Supplier
            </h3>
            <div className="space-y-2.5 text-xs text-coffee-800">
              {order.supplier ? (
                <>
                  <p className="font-extrabold text-sm text-coffee-950">{order.supplier.name}</p>
                  <p><span className="font-semibold text-coffee-500">Phone:</span> {order.supplier.phone}</p>
                  <p className="text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-md inline-block font-semibold">
                    Assigned driver is delivering your order!
                  </p>
                </>
              ) : order.orderStatus === 'ready' ? (
                <p className="text-coffee-500 italic">Waiting for an available courier to accept the delivery job...</p>
              ) : order.orderStatus === 'accepted' ? (
                <p className="text-coffee-500 italic">Driver assigned. Order is preparing/ready for pickup.</p>
              ) : (
                <p className="text-coffee-500 italic">Baristas are preparing your order. A driver will claim it soon.</p>
              )}
            </div>
          </section>
        </div>

        {/* Invoice breakdown */}
        <section className="bg-white rounded-2xl border border-coffee-200/50 p-6 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-coffee-950 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-coffee-400" />
            Receipt Summary
          </h3>
          <ul className="divide-y divide-coffee-200/40 mb-4">
            {order.items.map((item) => (
              <li key={item._id} className="py-2.5 flex items-center justify-between text-xs text-coffee-800">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-coffee-950 text-[10px] bg-coffee-200 px-2 py-0.5 rounded-md">
                    {item.quantity}x
                  </span>
                  <span className="font-bold">{item.coffee.name}</span>
                </div>
                <span className="font-semibold">${(item.coffee.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 text-xs text-coffee-700 pt-3 border-t border-coffee-200/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between">
                <span>Tip</span>
                <span>${order.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-coffee-950 border-t border-coffee-200/60 pt-2.5">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="flex items-center gap-1 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
          >
            View Order History
          </Link>
          <Link
            to="/"
            className="bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all"
          >
            Order Something Else
          </Link>
        </div>

      </main>

    </div>
  );
};

export default OrderSuccess;
