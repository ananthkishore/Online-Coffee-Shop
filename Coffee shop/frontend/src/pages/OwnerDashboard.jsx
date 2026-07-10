import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import MenuCard from '../components/Shop/MenuCard';
import {
  Store,
  Coffee,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Upload,
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  MapPin,
  Phone,
  Play,
  RefreshCw,
  X
} from 'lucide-react';

const OwnerDashboard = () => {
  const [shop, setShop] = useState(null);
  const [coffees, setCoffees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders, shop, menu
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  
  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);
  const [coffeeLoading, setCoffeeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const pollRef = useRef(null);
  const shopExistsRef = useRef(false); // Track whether the owner has a shop, to guard polling

  // Shop form states (for create & edit)
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopOpenTime, setShopOpenTime] = useState('08:00');
  const [shopCloseTime, setShopCloseTime] = useState('20:00');
  const [shopImageFile, setShopImageFile] = useState(null);

  // Coffee form/modal states
  const [coffeeModal, setCoffeeModal] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [coffeeName, setCoffeeName] = useState('');
  const [coffeeDesc, setCoffeeDesc] = useState('');
  const [coffeePrice, setCoffeePrice] = useState('');
  const [coffeeCategory, setCoffeeCategory] = useState('Espresso');
  const [coffeeAvailable, setCoffeeAvailable] = useState(true);
  const [coffeeImageFile, setCoffeeImageFile] = useState(null);

  // Fetch shop, menu, and orders
  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Fetch current owner's shop (returns data: null if not registered yet — never 404)
      const shopRes = await api.get('/shops/my-shop');
      if (shopRes.data.success && shopRes.data.data) {
        const activeShop = shopRes.data.data;
        setShop(activeShop);
        shopExistsRef.current = true;

        // Populate shop form states
        setShopName(activeShop.name);
        setShopDesc(activeShop.description);
        setShopAddress(activeShop.address);
        setShopPhone(activeShop.phone);
        setShopOpenTime(activeShop.openTime);
        setShopCloseTime(activeShop.closeTime);

        // 2. Fetch coffees for this shop
        const coffeesRes = await api.get(`/coffees/shop/${activeShop._id}`);
        if (coffeesRes.data.success) {
          setCoffees(coffeesRes.data.data);
        }

        // 3. Fetch orders for this shop
        const ordersRes = await api.get('/orders/owner');
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data);
        }
      } else {
        // No shop registered yet — this is normal for a new owner
        shopExistsRef.current = false;
      }
    } catch (error) {
      console.error('Owner dashboard load failed:', error.response?.data?.message || error.message);
      setErrorMessage('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Poll orders every 20 seconds — only when the owner has a registered shop
    pollRef.current = setInterval(async () => {
      if (!shopExistsRef.current) return; // Skip if no shop yet
      try {
        setOrdersRefreshing(true);
        const ordersRes = await api.get('/orders/owner');
        if (ordersRes.data.success) setOrders(ordersRes.data.data);
      } catch (_) {/* silent */} finally {
        setOrdersRefreshing(false);
      }
    }, 20000);

    return () => clearInterval(pollRef.current);
  }, []);

  const triggerToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // 1. Shop Creation / Registration
  const handleCreateShop = async (e) => {
    e.preventDefault();
    setShopLoading(true);
    setErrorMessage('');

    if (!shopName || !shopAddress || !shopPhone || !shopOpenTime || !shopCloseTime) {
      setErrorMessage('Please fill in all required shop fields');
      setShopLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', shopName);
      formData.append('description', shopDesc);
      formData.append('address', shopAddress);
      formData.append('phone', shopPhone);
      formData.append('openTime', shopOpenTime);
      formData.append('closeTime', shopCloseTime);
      if (shopImageFile) {
        formData.append('image', shopImageFile);
      }

      const res = await api.post('/shops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShop(res.data.data);
        triggerToast('Coffee shop registered successfully!');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error registering coffee shop');
    } finally {
      setShopLoading(false);
    }
  };

  // 2. Shop update
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    setShopLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', shopName);
      formData.append('description', shopDesc);
      formData.append('address', shopAddress);
      formData.append('phone', shopPhone);
      formData.append('openTime', shopOpenTime);
      formData.append('closeTime', shopCloseTime);
      if (shopImageFile) {
        formData.append('image', shopImageFile);
      }

      const res = await api.put(`/shops/${shop._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShop(res.data.data);
        triggerToast('Shop profile updated successfully!');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Update failed', false);
    } finally {
      setShopLoading(false);
    }
  };

  // 3. Toggle Open/Closed status
  const handleToggleStatus = async () => {
    try {
      const res = await api.patch(`/shops/${shop._id}/toggle-status`);
      if (res.data.success) {
        setShop(res.data.data);
        triggerToast(`Shop status changed to ${res.data.data.isOpen ? 'OPEN' : 'CLOSED'}`);
      }
    } catch (err) {
      triggerToast('Failed to toggle status', false);
    }
  };

  // 4. Coffee CRUD logic
  const handleOpenCoffeeModal = (coffee = null) => {
    if (coffee) {
      // Edit mode
      setEditingCoffee(coffee);
      setCoffeeName(coffee.name);
      setCoffeeDesc(coffee.description);
      setCoffeePrice(coffee.price.toString());
      setCoffeeCategory(coffee.category);
      setCoffeeAvailable(coffee.isAvailable);
    } else {
      // Add mode
      setEditingCoffee(null);
      setCoffeeName('');
      setCoffeeDesc('');
      setCoffeePrice('');
      setCoffeeCategory('Espresso');
      setCoffeeAvailable(true);
    }
    setCoffeeImageFile(null);
    setCoffeeModal(true);
  };

  const handleCoffeeSubmit = async (e) => {
    e.preventDefault();
    setCoffeeLoading(true);
    
    if (!coffeeName || !coffeePrice || !coffeeCategory) {
      triggerToast('Please fill in Name, Price and Category', false);
      setCoffeeLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', coffeeName);
      formData.append('description', coffeeDesc);
      formData.append('price', coffeePrice);
      formData.append('category', coffeeCategory);
      formData.append('isAvailable', coffeeAvailable);
      if (coffeeImageFile) {
        formData.append('image', coffeeImageFile);
      }

      let res;
      if (editingCoffee) {
        // Update API
        res = await api.put(`/coffees/${editingCoffee._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create API
        res = await api.post('/coffees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        triggerToast(editingCoffee ? 'Menu item updated!' : 'New menu item added!');
        setCoffeeModal(false);
        // reload catalog
        const list = await api.get(`/coffees/shop/${shop._id}`);
        setCoffees(list.data.data);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error processing menu item', false);
    } finally {
      setCoffeeLoading(false);
    }
  };

  const handleDeleteCoffee = async (coffeeId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await api.delete(`/coffees/${coffeeId}`);
      if (res.data.success) {
        triggerToast('Menu item deleted');
        setCoffees(prev => prev.filter(c => c._id !== coffeeId));
      }
    } catch (err) {
      triggerToast('Delete failed', false);
    }
  };

  // 5. Update Order Status
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data.success) {
        triggerToast(`Order set to: ${nextStatus.toUpperCase()}`);
        // Update local orders list state
        setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o));
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to update order', false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleCoffeeAvailability = async (coffee) => {
    try {
      // Must use FormData because the PUT /coffees/:id route uses multer upload middleware
      const formData = new FormData();
      formData.append('isAvailable', String(!coffee.isAvailable));
      const res = await api.put(`/coffees/${coffee._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        triggerToast(`Item availability set to ${res.data.data.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}`);
        setCoffees(prev => prev.map(c => c._id === coffee._id ? res.data.data : c));
      }
    } catch (err) {
      triggerToast('Failed to toggle coffee availability', false);
    }
  };

  // Filter orders by active column
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
  const receivedOrders = orders.filter(o => o.orderStatus === 'received');
  const readyAndCourierOrders = orders.filter(o => ['ready', 'accepted', 'picked_up', 'delivered'].includes(o.orderStatus));

  const getShopImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800';
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-coffee-800 animate-pulse">Waking up the dashboard...</p>
      </div>
    );
  }

  // If no shop is registered for this owner
  if (!shop) {
    return (
      <div className="min-h-screen bg-coffee-50/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3.5 bg-coffee-950 text-coffee-200 rounded-3xl mb-4 shadow-sm">
              <Store className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-coffee-950 font-sans tracking-tight">Register Your Coffee Shop</h1>
            <p className="text-sm text-coffee-500 mt-2">
              Setup your shop profile details to start receiving coffee orders and managing menu items.
            </p>
          </div>

          <form onSubmit={handleCreateShop} className="bg-white rounded-3xl border border-coffee-200 p-6 sm:p-8 shadow-sm space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500"
                  placeholder="e.g. Mocha Magic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Shop Phone</label>
                <input
                  type="text"
                  required
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500 resize-none"
                placeholder="Brief summary about your coffee blends and special offerings..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Full Address</label>
              <input
                type="text"
                required
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500"
                placeholder="Street address, City, ZIP Code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Opening Time</label>
                <input
                  type="text"
                  required
                  value={shopOpenTime}
                  onChange={(e) => setShopOpenTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500 text-center"
                  placeholder="e.g. 08:00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Closing Time</label>
                <input
                  type="text"
                  required
                  value={shopCloseTime}
                  onChange={(e) => setShopCloseTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-sm text-coffee-950 outline-none focus:border-coffee-500 text-center"
                  placeholder="e.g. 20:00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Shop Profile Banner Image</label>
              <div className="flex items-center gap-4 bg-coffee-50/50 p-4 border border-dashed border-coffee-300 rounded-xl justify-center cursor-pointer relative hover:bg-coffee-100/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setShopImageFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-coffee-400" />
                <span className="text-xs font-bold text-coffee-700">
                  {shopImageFile ? shopImageFile.name : 'Select JPG or PNG file'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={shopLoading}
              className="w-full bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              {shopLoading ? 'Registering Shop...' : 'Register Coffee Shop'}
            </button>
          </form>

        </div>
      </div>
    );
  }

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

      {/* Main Dashboard Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Profile Card Header */}
        <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-coffee-100 border border-coffee-200">
              <img
                src={getShopImageUrl(shop.image)}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-coffee-950 font-sans">{shop.name}</h1>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  shop.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-xs text-coffee-500 mt-1 max-w-md">{shop.description}</p>
            </div>
          </div>

          {/* Quick open status toggle button */}
          <div className="flex justify-center">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                shop.isOpen
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-coffee-200 text-coffee-700 hover:bg-coffee-300'
              }`}
            >
              {shop.isOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {shop.isOpen ? 'Set Shop Closed' : 'Set Shop Open'}
            </button>
          </div>
        </section>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-coffee-200/60 pb-1 mb-8 gap-4 overflow-x-auto scrollbar-thin">
          {[
            { id: 'orders', label: 'Incoming Orders', icon: ClipboardList, count: orders.filter(o => ['pending', 'received'].includes(o.orderStatus)).length },
            { id: 'menu', label: 'Menu Catalog', icon: Coffee },
            { id: 'shop', label: 'Shop Settings', icon: Store }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-3 px-1 text-sm font-bold transition-all relative ${
                  isTabActive
                    ? 'text-coffee-950 border-b-2 border-coffee-600'
                    : 'text-coffee-400 hover:text-coffee-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-coffee-500 text-coffee-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Incoming Orders Board */}
        {activeTab === 'orders' && (
          <>
            {/* Orders board live indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-coffee-500">
                <span className={`w-2 h-2 rounded-full ${ordersRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
                {ordersRefreshing ? 'Syncing orders...' : 'Live order board'}
              </div>
              <button
                onClick={async () => {
                  try {
                    setOrdersRefreshing(true);
                    const r = await api.get('/orders/owner');
                    if (r.data.success) setOrders(r.data.data);
                  } catch (_) {} finally { setOrdersRefreshing(false); }
                }}
                disabled={ordersRefreshing}
                className="flex items-center gap-1.5 text-xs font-bold text-coffee-700 bg-white border border-coffee-200 hover:bg-coffee-50 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Pending Acceptance */}
            <div className="bg-coffee-100/50 rounded-2xl border border-coffee-200/50 p-4">
              <h3 className="text-xs font-black text-coffee-800 uppercase tracking-wider mb-4 flex justify-between items-center bg-white p-2 px-3 border border-coffee-200 rounded-lg">
                <span>1. New Requests</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px]">
                  {pendingOrders.length}
                </span>
              </h3>
              
              <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-xs text-coffee-400 italic py-8">No new requests</p>
                ) : (
                  pendingOrders.map(order => (
                    <div key={order._id} className="bg-white border border-coffee-200/60 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-coffee-900">Cust: {order.customer.name}</p>
                          <p className="text-[10px] text-coffee-400 mt-0.5">ID: #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                        </div>
                        <span className="font-extrabold text-xs text-coffee-800">${order.total.toFixed(2)}</span>
                      </div>
                      
                      {/* item overview */}
                      <ul className="text-[10px] text-coffee-500 space-y-0.5 list-disc pl-3">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.quantity}x {item.coffee.name}</li>
                        ))}
                      </ul>

                      {/* Action trigger */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="flex-1 bg-coffee-100 hover:bg-coffee-200 text-coffee-850 text-xs font-bold py-2 rounded-lg transition-colors active:scale-95"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'received')}
                          className="flex-1 flex items-center justify-center gap-1 bg-coffee-500 hover:bg-coffee-600 text-coffee-950 text-xs font-bold py-2 rounded-lg transition-colors active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" /> Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: In Preparation */}
            <div className="bg-coffee-100/50 rounded-2xl border border-coffee-200/50 p-4">
              <h3 className="text-xs font-black text-coffee-800 uppercase tracking-wider mb-4 flex justify-between items-center bg-white p-2 px-3 border border-coffee-200 rounded-lg">
                <span>2. In Kitchen</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                  {receivedOrders.length}
                </span>
              </h3>

              <div className="space-y-4">
                {receivedOrders.length === 0 ? (
                  <p className="text-center text-xs text-coffee-400 italic py-8">No active preparation</p>
                ) : (
                  receivedOrders.map(order => (
                    <div key={order._id} className="bg-white border border-coffee-200/60 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-coffee-900">Cust: {order.customer.name}</p>
                          <p className="text-[10px] text-coffee-400 mt-0.5">ID: #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                        </div>
                        <span className="font-extrabold text-xs text-coffee-800">${order.total.toFixed(2)}</span>
                      </div>
                      
                      <ul className="text-[10px] text-coffee-500 space-y-0.5 list-disc pl-3">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.quantity}x {item.coffee.name}</li>
                        ))}
                      </ul>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="flex-1 bg-coffee-100 hover:bg-coffee-200 text-coffee-850 text-xs font-bold py-2 rounded-lg transition-colors active:scale-95"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'ready')}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg transition-colors active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Logistics (Ready, Courier Out, Delivered logs) */}
            <div className="bg-coffee-100/50 rounded-2xl border border-coffee-200/50 p-4">
              <h3 className="text-xs font-black text-coffee-800 uppercase tracking-wider mb-4 flex justify-between items-center bg-white p-2 px-3 border border-coffee-200 rounded-lg">
                <span>3. Delivery Logs</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">
                  {readyAndCourierOrders.length}
                </span>
              </h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {readyAndCourierOrders.length === 0 ? (
                  <p className="text-center text-xs text-coffee-400 italic py-8">No delivery logs today</p>
                ) : (
                  readyAndCourierOrders.map(order => (
                    <div key={order._id} className="bg-white border border-coffee-200/60 rounded-xl p-4 shadow-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-coffee-800">
                          ID: #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-coffee-700">Cust: <span className="font-bold text-coffee-950">{order.customer.name}</span></p>
                      
                      {order.supplier ? (
                        <p className="text-[10px] text-coffee-500">Driver: <span className="font-semibold text-coffee-800">{order.supplier.name}</span></p>
                      ) : (
                        <p className="text-[10px] text-yellow-600 italic font-medium">Waiting for driver assignment...</p>
                      )}
                      <button
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="w-full mt-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-850 text-[11px] font-bold py-1.5 rounded-lg transition-colors active:scale-95"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>
          </>
        )}

        {/* TAB 2: Menu Catalog CRUD */}
        {activeTab === 'menu' && (
          <section>
            
            {/* Header action catalog */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-coffee-950">Coffee Menu</h3>
                <p className="text-xs text-coffee-500">Manage products, pricing, and sold-out availability states</p>
              </div>
              <button
                onClick={() => handleOpenCoffeeModal(null)}
                className="flex items-center gap-1 bg-coffee-950 text-coffee-200 hover:text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Add Menu Item
              </button>
            </div>

            {/* Menu catalog list */}
            {coffees.length === 0 ? (
              <div className="text-center py-20 bg-white border border-coffee-200/40 rounded-3xl p-8 max-w-sm mx-auto shadow-xs">
                <p className="text-sm font-semibold text-coffee-900">Your Menu is empty</p>
                <p className="text-xs text-coffee-400 mt-1 mb-4">Add your first delicious coffee brew to begin sales.</p>
                <button
                  onClick={() => handleOpenCoffeeModal(null)}
                  className="bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Create First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {coffees.map((coffee) => (
                  <MenuCard
                    key={coffee._id}
                    item={coffee}
                    isOwnerView={true}
                    onEdit={handleOpenCoffeeModal}
                    onDelete={handleDeleteCoffee}
                    onToggleAvailability={handleToggleCoffeeAvailability}
                  />
                ))}
              </div>
            )}

            {/* Modal Dialog for Menu Item Create & Update */}
            {coffeeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl border border-coffee-200 w-full max-w-md shadow-2xl p-6 relative">
                  <h3 className="text-lg font-bold text-coffee-950 mb-4">
                    {editingCoffee ? 'Edit Coffee details' : 'Add New Coffee Item'}
                  </h3>

                  <form onSubmit={handleCoffeeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-coffee-800 uppercase mb-1.5">Coffee Name</label>
                      <input
                        type="text"
                        required
                        value={coffeeName}
                        onChange={(e) => setCoffeeName(e.target.value)}
                        className="w-full px-3 py-2 bg-coffee-50/50 border border-coffee-200 rounded-lg text-xs outline-none focus:border-coffee-500"
                        placeholder="e.g. Vanilla Iced Latte"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-coffee-800 uppercase mb-1.5">Price ($)</label>
                        <input
                          type="number"
                          step="0.05"
                          required
                          value={coffeePrice}
                          onChange={(e) => setCoffeePrice(e.target.value)}
                          className="w-full px-3 py-2 bg-coffee-50/50 border border-coffee-200 rounded-lg text-xs outline-none focus:border-coffee-500"
                          placeholder="e.g. 4.95"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-coffee-800 uppercase mb-1.5">Category</label>
                        <select
                          value={coffeeCategory}
                          onChange={(e) => setCoffeeCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-coffee-50/50 border border-coffee-200 rounded-lg text-xs outline-none focus:border-coffee-500 text-coffee-800 font-semibold"
                        >
                          <option value="Espresso">Espresso</option>
                          <option value="Latte">Latte</option>
                          <option value="Cold Brew">Cold Brew</option>
                          <option value="Cappuccino">Cappuccino</option>
                          <option value="Pastry">Pastry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-coffee-800 uppercase mb-1.5">Description</label>
                      <textarea
                        value={coffeeDesc}
                        onChange={(e) => setCoffeeDesc(e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 bg-coffee-50/50 border border-coffee-200 rounded-lg text-xs outline-none focus:border-coffee-500 resize-none"
                        placeholder="Detail the brew elements, notes, toppings..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-coffee-800 uppercase mb-1.5">Product Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoffeeImageFile(e.target.files[0])}
                        className="w-full text-xs text-coffee-600 bg-coffee-50/50 border border-coffee-200 p-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        id="coffee-avail"
                        type="checkbox"
                        checked={coffeeAvailable}
                        onChange={(e) => setCoffeeAvailable(e.target.checked)}
                        className="h-4 w-4 rounded border-coffee-300 text-coffee-600"
                      />
                      <label htmlFor="coffee-avail" className="text-xs font-bold text-coffee-800 cursor-pointer">
                        Mark Available for Purchase
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-coffee-100 justify-end">
                      <button
                        type="button"
                        onClick={() => setCoffeeModal(false)}
                        className="px-4 py-2 text-xs font-bold text-coffee-700 bg-coffee-100 rounded-lg hover:bg-coffee-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={coffeeLoading}
                        className="px-4 py-2 text-xs font-bold text-coffee-950 bg-coffee-500 rounded-lg hover:bg-coffee-600 shadow-sm"
                      >
                        {coffeeLoading ? 'Saving...' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Shop Profile Settings */}
        {activeTab === 'shop' && (
          <section className="bg-white rounded-3xl border border-coffee-200/50 p-6 sm:p-8 max-w-2xl shadow-sm">
            <h3 className="text-lg font-bold text-coffee-950 border-b border-coffee-200/60 pb-3 mb-6">
              Shop Configuration Settings
            </h3>

            <form onSubmit={handleUpdateShop} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Shop Phone</label>
                  <input
                    type="text"
                    required
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={shopDesc}
                  onChange={(e) => setShopDesc(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Full Address</label>
                <input
                  type="text"
                  required
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Open Time (hours)</label>
                  <input
                    type="text"
                    required
                    value={shopOpenTime}
                    onChange={(e) => setShopOpenTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500 text-center font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Close Time (hours)</label>
                  <input
                    type="text"
                    required
                    value={shopCloseTime}
                    onChange={(e) => setShopCloseTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-coffee-50/50 border border-coffee-200 rounded-xl text-xs text-coffee-950 outline-none focus:border-coffee-500 text-center font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">Modify Banner Image File</label>
                <div className="flex items-center gap-4 bg-coffee-50/50 p-4 border border-dashed border-coffee-300 rounded-xl justify-center cursor-pointer relative hover:bg-coffee-100/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setShopImageFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-coffee-400" />
                  <span className="text-xs font-bold text-coffee-700">
                    {shopImageFile ? shopImageFile.name : 'Select a new JPG/PNG file to replace current'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-coffee-100 flex justify-end">
                <button
                  type="submit"
                  disabled={shopLoading}
                  className="bg-coffee-950 hover:bg-coffee-900 text-coffee-200 hover:text-white font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  {shopLoading ? 'Updating Profile...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </section>
        )}

      </main>

      {/* Detailed Order Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-coffee-200 w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedOrderForDetails(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-coffee-400 hover:bg-coffee-100 hover:text-coffee-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-coffee-950 mb-4 border-b border-coffee-200 pb-3">
              Order Details - #{selectedOrderForDetails._id.substring(selectedOrderForDetails._id.length - 8).toUpperCase()}
            </h3>

            <div className="space-y-4 text-xs text-coffee-800">
              
              {/* Customer and Contact Details */}
              <div className="grid grid-cols-2 gap-4 bg-coffee-50/50 p-3.5 rounded-xl border border-coffee-200/50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-coffee-400">Customer Name</p>
                  <p className="font-extrabold text-coffee-950 mt-0.5">{selectedOrderForDetails.customer?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-coffee-400">Phone</p>
                  <p className="font-extrabold text-coffee-950 mt-0.5">{selectedOrderForDetails.address?.mobileNumber || selectedOrderForDetails.customer?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Delivery Address Details */}
              <div className="bg-coffee-50/50 p-3.5 rounded-xl border border-coffee-200/50">
                <p className="text-[10px] uppercase font-bold text-coffee-400 mb-1">Delivery Address</p>
                {selectedOrderForDetails.address ? (
                  <p className="font-medium text-coffee-950 leading-relaxed">
                    {selectedOrderForDetails.address.fullName} ({selectedOrderForDetails.address.mobileNumber})<br />
                    {selectedOrderForDetails.address.houseNo}, {selectedOrderForDetails.address.street}, {selectedOrderForDetails.address.area}<br />
                    {selectedOrderForDetails.address.city}, {selectedOrderForDetails.address.state} - {selectedOrderForDetails.address.pincode}
                    {selectedOrderForDetails.address.landmark && <><br /><span className="text-coffee-500 font-semibold">Landmark: {selectedOrderForDetails.address.landmark}</span></>}
                  </p>
                ) : (
                  <p className="italic text-coffee-500">No delivery address saved (using fallback customer phone: {selectedOrderForDetails.customer?.phone})</p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <p className="text-[10px] uppercase font-bold text-coffee-400 mb-2">Ordered Items</p>
                <ul className="divide-y divide-coffee-200/50 bg-coffee-50/30 border border-coffee-200/50 rounded-xl px-4 py-2">
                  {selectedOrderForDetails.items.map((item, idx) => (
                    <li key={idx} className="py-2.5 flex items-center justify-between text-coffee-800">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-coffee-950 text-[10px] bg-coffee-200 px-2 py-0.5 rounded-md">
                          {item.quantity}x
                        </span>
                        <span className="font-bold">{item.coffee?.name}</span>
                      </div>
                      <span className="font-semibold">${((item.coffee?.price ?? 0) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Financial Summary */}
              <div className="space-y-1.5 border-t border-coffee-200 pt-3 text-coffee-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedOrderForDetails.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${selectedOrderForDetails.deliveryFee?.toFixed(2)}</span>
                </div>
                {selectedOrderForDetails.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${selectedOrderForDetails.tip?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-coffee-950 border-t border-coffee-200 pt-2">
                  <span>Total Amount</span>
                  <span>${selectedOrderForDetails.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Status and Payment Information */}
              <div className="grid grid-cols-2 gap-4 bg-coffee-50/50 p-3.5 rounded-xl border border-coffee-200/50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-coffee-400">Payment Status & Method</p>
                  <p className="font-extrabold text-coffee-950 mt-0.5 capitalize">
                    {selectedOrderForDetails.paymentStatus === 'paid' ? 'Paid' : selectedOrderForDetails.paymentStatus || 'Pending'} ({selectedOrderForDetails.paymentMethod || 'Credit Card'})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-coffee-400">Order Placed At</p>
                  <p className="font-extrabold text-coffee-950 mt-0.5">{formatDate(selectedOrderForDetails.createdAt)}</p>
                </div>
              </div>

              {/* Status & Assignment */}
              <div className="bg-coffee-50/50 p-3.5 rounded-xl border border-coffee-200/50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-coffee-400">Current Status</p>
                  <p className="font-extrabold text-coffee-950 mt-0.5 capitalize">{selectedOrderForDetails.orderStatus?.replace('_', ' ')}</p>
                </div>
                {selectedOrderForDetails.supplier && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-coffee-400">Assigned Driver</p>
                    <p className="font-extrabold text-coffee-950 mt-0.5">{selectedOrderForDetails.supplier.name} ({selectedOrderForDetails.supplier.phone})</p>
                  </div>
                )}
              </div>

            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderForDetails(null)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-coffee-200 bg-coffee-950 hover:bg-coffee-900 rounded-xl shadow-md transition-all duration-200"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
