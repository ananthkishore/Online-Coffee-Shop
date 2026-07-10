import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Edit, Trash2, Check } from 'lucide-react';

const MenuCard = ({ item, isOwnerView, onEdit, onDelete, onToggleAvailability }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800'; // coffee cup fallback
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const res = await addToCart(item._id, 1);
    setAdding(false);
    if (res?.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const canOrder = !user || user.role === 'customer';

  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-coffee-200/50 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Coffee Image */}
      <div className="relative h-44 w-full bg-coffee-100 overflow-hidden">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-coffee-950/80 text-coffee-300 backdrop-blur-sm text-[10px] uppercase font-bold px-2 py-0.5 rounded">
          {item.category}
        </div>
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-coffee-900 text-coffee-200 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded tracking-wider shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Coffee Details */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-coffee-950 text-base">{item.name}</h4>
            <span className="font-extrabold text-coffee-800 text-base">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-coffee-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description || 'Brewed with 100% premium single-origin Arabica beans, roasted fresh and served perfectly.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-coffee-100 flex items-center justify-between">
          
          {/* Owner Dashboard Actions */}
          {isOwnerView ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => onEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors duration-150"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-150"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {onToggleAvailability && (
                <button
                  onClick={() => onToggleAvailability(item)}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                    item.isAvailable 
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                </button>
              )}
            </div>
          ) : (
            
            /* Customer View / Cart Actions */
            canOrder ? (
              <button
                onClick={handleAddToCart}
                disabled={!item.isAvailable || adding || success}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                  success
                    ? 'bg-green-500 text-white'
                    : !item.isAvailable
                    ? 'bg-coffee-200 text-coffee-400 cursor-not-allowed'
                    : 'bg-coffee-500 text-coffee-950 hover:bg-coffee-600 shadow-sm'
                }`}
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart!
                  </>
                ) : adding ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              // If logged in as non-customer, don't show customer action buttons
              <span className="text-[10px] text-coffee-400 font-medium italic">
                Log in as customer to order
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
