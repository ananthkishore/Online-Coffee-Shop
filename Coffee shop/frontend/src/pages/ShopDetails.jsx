import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MenuCard from '../components/Shop/MenuCard';
import { ArrowLeft, Clock, MapPin, Phone, Coffee, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ShopDetails = () => {
  const { id } = useParams();
  const { getCartShopId, clearCart, cartItems } = useCart();
  const [shop, setShop] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [warningModal, setWarningModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/shops/${id}`);
        if (response.data.success) {
          setShop(response.data.data.shop);
          setMenu(response.data.data.menu);
        }
      } catch (err) {
        console.error('Fetch shop details error:', err.message);
        setError('Coffee shop details could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-50/40 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-coffee-700 animate-pulse">Setting up the barista station...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-coffee-50/40 px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-coffee-950">{error || 'Shop not found'}</h3>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-coffee-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600';
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
  };

  // Get unique categories for filtration
  const categories = ['All', ...new Set(menu.map((item) => item.category))];

  const filteredMenu = activeCategory === 'All'
    ? menu
    : menu.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-coffee-50/40 pb-20">
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-coffee-700 hover:text-coffee-950 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to shops
        </Link>
      </div>

      {/* Shop Banner Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="rounded-3xl overflow-hidden shadow-md border border-coffee-200/50 bg-white flex flex-col md:flex-row-reverse md:h-80">
          <div className="h-48 md:h-full w-full md:w-1/2 relative flex-shrink-0">
            <img
              src={getImageUrl(shop.image)}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-coffee-950/85 via-coffee-950/30 to-transparent"></div>
          </div>
          
          {/* Shop Header Content */}
          <div className="p-6 sm:p-8 text-slate-800 md:text-coffee-100 bg-white md:bg-coffee-950 flex flex-col justify-center flex-grow">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black font-sans text-coffee-950 md:text-white">{shop.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow uppercase tracking-wide ${
                  shop.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-coffee-700 md:text-coffee-300 mt-2 leading-relaxed">
                {shop.description || 'Delivering premium organic coffee, handcrafted drinks, and artisanal snacks.'}
              </p>

              {/* Shop contact / address info */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2.5 mt-4 text-xs text-coffee-600 md:text-coffee-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-coffee-500 md:text-coffee-400" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-coffee-500 md:text-coffee-400" />
                  <span>Hours: {shop.openTime} - {shop.closeTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4.5 h-4.5 text-coffee-500 md:text-coffee-400" />
                  <span>{shop.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu / Section list */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Category filtering badges */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-thin border-b border-coffee-200/50 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex-shrink-0 ${
                activeCategory === category
                  ? 'bg-coffee-950 text-coffee-200 shadow-sm'
                  : 'bg-white text-coffee-700 border border-coffee-200 hover:bg-coffee-100/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        <div>
          <h2 className="text-xl font-bold text-coffee-950 flex items-center gap-2 mb-6">
            <Coffee className="w-5 h-5 text-coffee-500" />
            Menu Offerings
          </h2>

          {filteredMenu.length === 0 ? (
            <div className="text-center py-16 bg-white border border-coffee-200/40 rounded-2xl p-6 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-coffee-800">No items available</p>
              <p className="text-xs text-coffee-500 mt-1">There are currently no items under this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenu.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  isOwnerView={false}
                />
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default ShopDetails;
