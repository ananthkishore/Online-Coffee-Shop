import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone } from 'lucide-react';

const ShopCard = ({ shop }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'; // high-end shop fallback image
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
  };

  return (
    <Link
      to={`/shop/${shop._id}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-coffee-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white to-coffee-50/20"
    >
      {/* Status Overlay for Closed Shops */}
      {!shop.isOpen && (
        <div className="absolute inset-0 z-10 bg-coffee-950/40 backdrop-blur-[1.5px] flex items-center justify-center">
          <span className="bg-red-500 text-white font-extrabold text-xs uppercase px-3 py-1.5 rounded-full shadow-md tracking-wider">
            Closed Temporary
          </span>
        </div>
      )}

      {/* Shop Image */}
      <div className="relative h-48 w-full overflow-hidden bg-coffee-100">
        <img
          src={getImageUrl(shop.image)}
          alt={shop.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-65"></div>
        {shop.isOpen && (
          <span className="absolute top-3 right-3 z-10 bg-green-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm tracking-wider">
            Open
          </span>
        )}
      </div>

      {/* Shop Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-coffee-950 group-hover:text-coffee-600 transition-colors duration-250">
            {shop.name}
          </h3>
          <p className="text-xs text-coffee-500 mt-1 line-clamp-2 leading-relaxed">
            {shop.description || 'Delivering premium freshly brewed espresso drinks and gourmet pastries right to your doorstep.'}
          </p>
        </div>

        <div className="space-y-2 mt-4 pt-3 border-t border-coffee-200/50 text-xs text-coffee-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-coffee-400 flex-shrink-0" />
            <span className="truncate">{shop.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-coffee-400 flex-shrink-0" />
            <span>
              {shop.openTime} - {shop.closeTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-coffee-400 flex-shrink-0" />
            <span>{shop.phone}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
