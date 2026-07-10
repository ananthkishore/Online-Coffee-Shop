import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Truck,
  DollarSign,
  TrendingUp,
  MapPin,
  ClipboardList,
  CheckCircle,
  Coins,
  Play,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const SupplierDashboard = () => {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    earnings: 0,
    tips: 0,
    todayDeliveriesCount: 0,
    todayEarnings: 0
  });

  const [availableJobs, setAvailableJobs] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const pollRef = useRef(null);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage('');
    try {
      // 1. Fetch dashboard stats
      const statsRes = await api.get('/supplier/dashboard');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch available jobs
      const jobsRes = await api.get('/supplier/available');
      if (jobsRes.data.success) {
        setAvailableJobs(jobsRes.data.data);
      }

      // 3. Fetch active/delivered order list
      const deliveriesRes = await api.get('/supplier/my-deliveries');
      if (deliveriesRes.data.success) {
        setMyDeliveries(deliveriesRes.data.data);
      }
    } catch (err) {
      console.error('Error loading supplier data:', err.message);
      if (!silent) setErrorMessage('Could not retrieve supplier records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Poll every 15 seconds so new "ready" orders appear automatically
    pollRef.current = setInterval(() => {
      loadDashboardData(true);
    }, 15000);

    return () => clearInterval(pollRef.current);
  }, []);

  const triggerToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3500);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4500);
    }
  };

  // Accept available delivery job
  const handleAcceptJob = async (orderId) => {
    try {
      const res = await api.patch(`/supplier/${orderId}/accept`);
      if (res.data.success) {
        triggerToast('Delivery job accepted! Navigate to the shop for pickup.');
        // refresh data
        loadDashboardData();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to accept job', false);
    }
  };

  // Update accepted delivery status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        triggerToast(`Status updated to: ${newStatus.toUpperCase().replace('_', ' ')}`);
        loadDashboardData();
      }
    } catch (err) {
      triggerToast('Failed to update status', false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-coffee-800 animate-pulse">Checking your courier log...</p>
      </div>
    );
  }

  // Active accepted deliveries (ready, accepted, or picked_up)
  const activeDeliveries = myDeliveries.filter(d => ['ready', 'accepted', 'picked_up'].includes(d.orderStatus));
  // Completed deliveries logs
  const pastDeliveries = myDeliveries.filter(d => d.orderStatus === 'delivered');

  return (
    <div className="min-h-screen bg-coffee-50/30 pb-20">
      
      {/* Toast Alert Indicators */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white font-bold px-4 py-3 rounded-xl shadow-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white font-bold px-4 py-3 rounded-xl shadow-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Title */}
        <div className="flex items-center gap-3 border-b border-coffee-200/50 pb-5 mb-8">
          <div className="p-2.5 bg-coffee-950 text-coffee-200 rounded-2xl shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-coffee-950 font-sans">Supplier Dashboard</h1>
            <p className="text-xs text-coffee-500 mt-0.5">Manage delivery jobs, review logistics, and check earnings</p>
          </div>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-bold text-coffee-700 bg-white border border-coffee-200 hover:bg-coffee-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Dashboard Statistics Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Card 1: Total Earnings */}
          <div className="bg-white border border-coffee-200/50 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-coffee-100 text-coffee-800 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Total Base Pay</p>
              <p className="text-xl font-black text-coffee-950">${stats.earnings.toFixed(2)}</p>
            </div>
          </div>

          {/* Card 2: Driver Tips */}
          <div className="bg-white border border-coffee-200/50 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-coffee-100 text-coffee-800 rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Customer Tips</p>
              <p className="text-xl font-black text-coffee-950">${stats.tips.toFixed(2)}</p>
            </div>
          </div>

          {/* Card 3: Today's Income */}
          <div className="bg-white border border-coffee-200/50 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-coffee-400 to-coffee-600 text-coffee-950 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Today's Income</p>
              <p className="text-xl font-black text-coffee-950">${stats.todayEarnings.toFixed(2)}</p>
            </div>
          </div>

          {/* Card 4: Total Deliveries count */}
          <div className="bg-white border border-coffee-200/50 p-5 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="p-3.5 bg-coffee-100 text-coffee-800 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-wider">Total Deliveries</p>
              <p className="text-xl font-black text-coffee-950">
                {stats.totalDeliveries} <span className="text-xs text-coffee-400 font-normal">({stats.todayDeliveriesCount} today)</span>
              </p>
            </div>
          </div>

        </section>

        {/* Dashboard Operations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Available & Active Job queues */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active Deliveries */}
            <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-coffee-950 border-b border-coffee-200/50 pb-3 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-coffee-500" />
                Active Deliveries ({activeDeliveries.length})
              </h2>

              {activeDeliveries.length === 0 ? (
                <p className="text-center text-xs text-coffee-500 italic py-10">No active delivery jobs. Accept one below to start earning.</p>
              ) : (
                <div className="space-y-6">
                  {activeDeliveries.map((delivery) => (
                    <div key={delivery._id} className="bg-coffee-50/50 border border-coffee-200/60 rounded-2xl p-5 space-y-4">
                      
                      {/* Delivery header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            ['ready', 'accepted'].includes(delivery.orderStatus) ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {delivery.orderStatus.replace('_', ' ')}
                          </span>
                          <h4 className="font-extrabold text-sm text-coffee-950 mt-2">Order from: {delivery.shop.name}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-coffee-400 font-bold">Payout Value</p>
                          <p className="text-sm font-extrabold text-coffee-950">${(delivery.deliveryFee + delivery.tip).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="space-y-2.5 text-xs text-coffee-700">
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                          <p>
                            <span className="font-bold text-coffee-950">Pickup:</span> {delivery.shop.address}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-coffee-950">Deliver to:</span>
                            {delivery.address ? (
                              <p className="mt-0.5 font-medium text-coffee-900">
                                {delivery.address.fullName} ({delivery.address.mobileNumber})<br />
                                {delivery.address.houseNo}, {delivery.address.street}, {delivery.address.area}<br />
                                {delivery.address.city}, {delivery.address.state} - {delivery.address.pincode}
                                {delivery.address.landmark && <><br /><span className="text-coffee-500 text-[11px]">Landmark: {delivery.address.landmark}</span></>}
                              </p>
                            ) : (
                              <p className="mt-0.5 italic text-coffee-500">
                                Location: Phone ({delivery.customer.phone})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Update Buttons */}
                      <div className="pt-2 border-t border-coffee-200/60 flex justify-end">
                        {['ready', 'accepted'].includes(delivery.orderStatus) ? (
                          <button
                            onClick={() => handleUpdateStatus(delivery._id, 'picked_up')}
                            className="bg-coffee-950 text-coffee-200 hover:text-white font-extrabold py-2 px-5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Play className="w-4 h-4" /> Picked Up from Shop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                            className="bg-green-50 hover:bg-green-600 text-white font-extrabold py-2 px-5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Delivered
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Available Jobs Queue */}
            <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-coffee-950 border-b border-coffee-200/50 pb-3 mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-coffee-500" />
                Available Deliveries ({availableJobs.length})
              </h2>

              {availableJobs.length === 0 ? (
                <p className="text-center text-xs text-coffee-500 italic py-10">No pending deliveries ready at shops right now. Please refresh later.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {availableJobs.map((job) => (
                    <div key={job._id} className="bg-white border border-coffee-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-coffee-300 transition-colors">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-sm text-coffee-950">{job.shop.name}</h4>
                          <span className="font-extrabold text-xs text-coffee-900 bg-coffee-100 px-2 py-0.5 rounded-md">
                            ${(job.deliveryFee + job.tip).toFixed(2)}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-coffee-500">
                          Tip: ${job.tip.toFixed(2)} | Fee: ${job.deliveryFee.toFixed(2)}
                        </p>

                        <div className="flex gap-1.5 text-xs text-coffee-600">
                          <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-coffee-950">Pickup:</span> {job.shop.address}
                          </div>
                        </div>
                        {job.address && (
                          <div className="flex gap-1.5 text-xs text-coffee-600 mt-1">
                            <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-coffee-950">Deliver to:</span> {job.address.area}, {job.address.city}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAcceptJob(job._id)}
                        className="w-full mt-4 bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold py-2 rounded-xl text-xs transition-colors active:scale-98 shadow-sm"
                      >
                        Accept delivery
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* RIGHT: Completed delivery history */}
          <aside className="lg:col-span-4 bg-white border border-coffee-200/50 p-6 rounded-3xl shadow-sm">
            <h2 className="text-sm font-bold text-coffee-950 border-b border-coffee-200/60 pb-3 mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-coffee-400" />
              Delivery History ({pastDeliveries.length})
            </h2>

            {pastDeliveries.length === 0 ? (
              <p className="text-center text-xs text-coffee-500 italic py-10">No deliveries registered yet</p>
            ) : (
              <ul className="divide-y divide-coffee-100 max-h-[60vh] overflow-y-auto pr-1">
                {pastDeliveries.map(item => (
                  <li key={item._id} className="py-3 text-xs flex justify-between gap-4">
                    <div>
                      <p className="font-bold text-coffee-900">{item.shop.name}</p>
                      <p className="text-[10px] text-coffee-400 mt-0.5">ID: #{item._id.substring(item._id.length - 6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-coffee-950">${(item.deliveryFee + item.tip).toFixed(2)}</p>
                      <span className="text-[9px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">Completed</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>

        </div>

      </main>

    </div>
  );
};

export default SupplierDashboard;
