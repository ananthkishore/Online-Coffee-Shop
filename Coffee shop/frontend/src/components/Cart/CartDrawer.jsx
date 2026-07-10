import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    deliveryFee,
    tip,
    setTip,
    total,
    addToCart,
    removeFromCart,
    clearCart,
    getCartShopId
  } = useCart();

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    
    // Validate if items belong to multiple shops (handled by UI naturally since we check details)
    const shopId = getCartShopId();
    if (!shopId) return;

    onClose();
    navigate('/checkout');
  };

  const getShopName = () => {
    if (cartItems.length === 0) return '';
    return cartItems[0].coffee?.shop?.name || 'Local Coffee Shop';
  };

  // Static backend upload files base URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500';
    return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-coffee-950/70 backdrop-blur-sm transition-opacity"
        />

        {/* Panel side drawer */}
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform bg-coffee-50 border-l border-coffee-200/80 shadow-2xl transition-all duration-500 ease-in-out flex flex-col h-full">
            
            {/* Drawer Header */}
            <div className="px-4 py-6 bg-coffee-950 text-coffee-100 flex items-center justify-between border-b border-coffee-900 shadow-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-coffee-400" />
                <h2 className="text-lg font-bold font-sans">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-coffee-400 hover:bg-coffee-900 hover:text-coffee-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body (Cart Items List) */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="p-4 bg-coffee-100 rounded-full text-coffee-400 mb-4">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-bold text-coffee-900">Your cart is empty</h3>
                  <p className="text-coffee-500 text-sm mt-1 max-w-xs">
                    Explore menu items and add some delicious fresh coffee to your order.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Shop Info indicator */}
                  <div className="p-3 bg-coffee-100/60 rounded-xl border border-coffee-200/40">
                    <p className="text-xs text-coffee-500 font-medium uppercase tracking-wider">Ordering from</p>
                    <p className="font-bold text-coffee-900">{getShopName()}</p>
                  </div>

                  {/* Cart Items */}
                  <ul className="divide-y divide-coffee-200/60">
                    {cartItems.map((item) => {
                      const coffee = item.coffee;
                      if (!coffee) return null;
                      return (
                        <li key={item._id || coffee._id} className="flex py-4 gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-coffee-200 bg-white">
                            <img
                              src={getImageUrl(coffee.image)}
                              alt={coffee.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-base font-bold text-coffee-900">
                                <h3>{coffee.name}</h3>
                                <p className="ml-4 text-coffee-800">${(coffee.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-0.5 text-xs text-coffee-500 capitalize">{coffee.category}</p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity Adjusters */}
                              <div className="flex items-center border border-coffee-300 rounded-lg bg-white shadow-sm overflow-hidden">
                                <button
                                  onClick={() => removeFromCart(coffee._id, false)}
                                  className="p-1 px-2 text-coffee-600 hover:bg-coffee-100 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 text-sm font-bold text-coffee-950">{item.quantity}</span>
                                <button
                                  onClick={() => addToCart(coffee._id, 1)}
                                  className="p-1 px-2 text-coffee-600 hover:bg-coffee-100 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Remove completely */}
                              <button
                                onClick={() => removeFromCart(coffee._id, true)}
                                className="text-coffee-400 hover:text-red-600 transition-colors duration-150"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {/* Clear Cart link */}
                  <div className="flex justify-end">
                    <button
                      onClick={clearCart}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Clear Entire Cart
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer (Summary & Checkout) */}
            {cartItems.length > 0 && (
              <div className="border-t border-coffee-200 bg-coffee-100/55 p-4 py-6 space-y-4">
                
                {/* Tip Selector */}
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-2">
                    Add Tip for delivery driver
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1.00, 2.00, 3.00, 5.00].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTip(amount)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${
                          tip === amount
                            ? 'bg-coffee-500 text-coffee-950 border-coffee-600 shadow-sm'
                            : 'bg-white text-coffee-700 border-coffee-300 hover:bg-coffee-50'
                        }`}
                      >
                        ${amount.toFixed(2)}
                      </button>
                    ))}
                  </div>
                  {/* Custom tip text input */}
                  <div className="mt-2 flex items-center justify-between bg-white rounded-lg border border-coffee-300 px-3 py-1 shadow-sm">
                    <span className="text-xs font-semibold text-coffee-600">Custom Tip ($)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={tip || ''}
                      onChange={(e) => setTip(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 text-right bg-transparent text-xs font-bold outline-none border-none text-coffee-950"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Subtotals & Fees */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-sm text-coffee-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-coffee-700">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  {tip > 0 && (
                    <div className="flex justify-between text-sm text-coffee-700">
                      <span>Driver Tip</span>
                      <span>${tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-coffee-950 pt-2 border-t border-coffee-200/80">
                    <span>Estimated Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-95"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                <p className="text-center text-[11px] text-coffee-500 mt-2">
                  Payments are secure. Powered by mock Stripe integration.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default CartDrawer;
