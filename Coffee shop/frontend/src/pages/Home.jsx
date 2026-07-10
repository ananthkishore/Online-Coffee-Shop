import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ShopCard from '../components/Shop/ShopCard';
import { Search, SlidersHorizontal, Coffee, Map, Flame } from 'lucide-react';

const Home = () => {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    setLoading(true);
    try {
      // Query 'all=true' if we want to show closed shops too, otherwise defaults to open shops on backend
      const response = await api.get(`/shops?all=true`);
      if (response.data.success) {
        setShops(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shops:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Filter shops based on search query and showOpenOnly status
  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase()) || 
                          shop.description.toLowerCase().includes(search.toLowerCase()) ||
                          shop.address.toLowerCase().includes(search.toLowerCase());
    
    const matchesOpen = showOpenOnly ? shop.isOpen : true;
    
    return matchesSearch && matchesOpen;
  });

  return (
    <div className="min-h-screen bg-coffee-50/40 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800 shadow-md">
        {/* Glow meshes for vibrant gradient highlights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs font-bold text-teal-300">
            <Flame className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>Vibrant, Expressive & Secure Stripe Checkout Included</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sans tracking-tight leading-tight">
            Crafting Delightful Coffee<br />
            <span className="bg-gradient-to-r from-sky-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">
              Right to Your Doorstep.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Browse local gourmet coffee shops, choose your favorites, pay securely using Stripe, and enjoy our colorful, premium ordering experience.
          </p>

          {/* Search bar inside Hero */}
          <div className="max-w-md mx-auto pt-4 relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/60 backdrop-blur-md rounded-2xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-slate-950/80 transition-all shadow-lg"
                placeholder="Search coffee shops, brews, or location..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Section header and filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-coffee-200/60 mb-8">
          <div>
            <h2 className="text-2xl font-black text-coffee-950 flex items-center gap-2">
              <Coffee className="w-6 h-6 text-coffee-500" />
              Browse Coffee Shops
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">Finding you the best fresh blends near your location</p>
          </div>

          {/* Filter switches */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-coffee-200 rounded-xl shadow-sm">
              <input
                id="open-only-toggle"
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="h-4 w-4 rounded border-coffee-300 text-coffee-600 focus:ring-coffee-500 cursor-pointer"
              />
              <label htmlFor="open-only-toggle" className="text-xs font-bold text-coffee-800 cursor-pointer select-none">
                Open Shops Only
              </label>
            </div>
          </div>
        </div>

        {/* Shop Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-semibold text-coffee-700">Loading shops...</p>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-white border border-coffee-200/50 rounded-2xl p-8 max-w-lg mx-auto">
            <div className="p-4 bg-coffee-100 rounded-full text-coffee-400 mb-4">
              <Map className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-coffee-950">No coffee shops found</h3>
            <p className="text-sm text-coffee-500 mt-1.5">
              We couldn't find any shops matching your criteria. Try adjusting your search query or toggling "Open Shops Only".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default Home;
