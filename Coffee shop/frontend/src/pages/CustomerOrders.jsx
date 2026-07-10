import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ClipboardList, Coffee, MapPin, Eye, Calendar, Sparkles } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/customer');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Fetch customer orders error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'received': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked_up': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-coffee-100 text-coffee-800 border-coffee-200';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50/40 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-coffee-700 animate-pulse">Retrieving your coffee records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-50/40 pb-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="flex items-center gap-3 border-b border-coffee-200/50 pb-5 mb-8">
          <div className="p-2.5 bg-coffee-950 text-coffee-200 rounded-2xl shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-coffee-950 font-sans">Order History</h1>
            <p className="text-xs text-coffee-500 mt-0.5">Track and review all your past and active orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-coffee-200/40 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <div className="p-4 bg-coffee-50 rounded-full text-coffee-400 mb-4 inline-block">
              <Coffee className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-coffee-900">No orders placed yet</h3>
            <p className="text-sm text-coffee-500 mt-1.5 leading-relaxed">
              Looks like you haven't ordered any delicious coffee yet. Visit the homepage to check out shops near you.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all"
            >
              Explore Coffee Shops
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-coffee-200/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between gap-6"
              >
                
                {/* Details column (left) */}
                <div className="space-y-3 flex-1">
                  
                  {/* Shop header info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-extrabold text-sm text-coffee-950">{order.shop?.name || 'Coffee Shop'}</span>
                    <span className={`text-[10px] font-extrabold uppercase border px-2.5 py-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Metadata: Date and Total */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-coffee-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-coffee-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-coffee-400" />
                      <span className="max-w-[200px] truncate">{order.shop?.address}</span>
                    </div>
                  </div>

                  {/* Items quick overview description */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-coffee-800">Items Ordered:</p>
                    <ul className="mt-1 space-y-1">
                      {order.items.map((item) => (
                        <li key={item._id} className="text-[11px] text-coffee-500">
                          {item.quantity}x {item.coffee?.name} (${(item.coffee?.price || 0).toFixed(2)} each)
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Pricing / Tracker Actions (right) */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 sm:border-l border-coffee-100 sm:pl-6 min-w-[120px]">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Total Paid</p>
                    <p className="text-lg font-black text-coffee-950">${order.total.toFixed(2)}</p>
                  </div>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="inline-flex items-center gap-1 bg-coffee-950 hover:bg-coffee-900 text-coffee-200 hover:text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Track Order
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default CustomerOrders;
