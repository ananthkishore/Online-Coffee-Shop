import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(0);

  const fetchCart = async () => {
    if (!user || user.role !== 'customer') return;
    setLoading(true);
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Fetch cart error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user logins/changes
  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchCart();
    } else {
      setCart(null);
      setTip(0);
    }
  }, [user]);

  // Add item or increment
  const addToCart = async (coffeeId, quantity = 1) => {
    if (!user || user.role !== 'customer') return;
    try {
      const response = await api.post('/cart/add', { coffeeId, quantity });
      if (response.data.success) {
        setCart(response.data.data);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error adding to cart'
      };
    }
  };

  // Decrement or remove item fully
  const removeFromCart = async (coffeeId, removeFully = false) => {
    if (!user || user.role !== 'customer') return;
    try {
      const response = await api.post('/cart/remove', { coffeeId, removeFully });
      if (response.data.success) {
        setCart(response.data.data);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error removing from cart'
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const response = await api.delete('/cart/clear');
      if (response.data.success) {
        setCart(prev => prev ? { ...prev, items: [] } : null);
        setTip(0);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error clearing cart'
      };
    }
  };

  // Derived properties
  const cartItems = cart?.items || [];
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.coffee?.price || 0) * item.quantity,
    0
  );
  
  const deliveryFee = cartItems.length > 0 ? 2.50 : 0;
  
  const total = Number((subtotal + deliveryFee + tip).toFixed(2));

  // Identify if cart contains items from multiple shops
  const getCartShopId = () => {
    if (cartItems.length === 0) return null;
    return cartItems[0].coffee?.shop?._id || cartItems[0].coffee?.shop;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        subtotal,
        deliveryFee,
        tip,
        total,
        setTip,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartShopId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
