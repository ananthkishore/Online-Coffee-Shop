import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Coffee, ShoppingCart, LogOut, User, ClipboardList, Home, Shield, Menu, X } from 'lucide-react';

const Navbar = ({ onCartClick }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-coffee-950/90 border-b border-coffee-900/60 shadow-lg px-4 py-3 sm:px-6 lg:px-8 text-coffee-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="p-2 bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-400 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md shadow-pink-500/10">
            <Coffee className="w-6 h-6 text-white font-bold" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-wide bg-gradient-to-r from-sky-400 via-pink-300 to-yellow-200 bg-clip-text text-transparent">
            AromaStream
          </span>
        </Link>

        {/* Navigation Links (Desktop only) */}
        <div className="hidden md:flex items-center gap-6">
          {(!user || user.role === 'customer') && (
            <Link
              to="/"
              className={`flex items-center gap-1.5 text-sm font-medium hover:text-coffee-300 transition-colors duration-200 ${
                isActive('/') ? 'text-coffee-400' : 'text-coffee-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          )}

          {user && user.role === 'customer' && (
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 text-sm font-medium hover:text-coffee-300 transition-colors duration-200 ${
                isActive('/orders') ? 'text-coffee-400' : 'text-coffee-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              My Orders
            </Link>
          )}

          {user && user.role === 'owner' && (
            <Link
              to="/owner-dashboard"
              className={`flex items-center gap-1.5 text-sm font-medium hover:text-coffee-300 transition-colors duration-200 ${
                isActive('/owner-dashboard') ? 'text-coffee-400' : 'text-coffee-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Owner Dashboard
            </Link>
          )}

          {user && user.role === 'supplier' && (
            <Link
              to="/supplier-dashboard"
              className={`flex items-center gap-1.5 text-sm font-medium hover:text-coffee-300 transition-colors duration-200 ${
                isActive('/supplier-dashboard') ? 'text-coffee-400' : 'text-coffee-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Supplier Dashboard
            </Link>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Customer Cart Icon Trigger */}
          {(!user || user.role === 'customer') && (
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-coffee-900/80 transition-all duration-200 group"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6 text-coffee-300 group-hover:text-coffee-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-coffee-500 text-coffee-950 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-coffee-950 shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-coffee-800/80">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-coffee-200">{user.name}</span>
                <span className="text-[11px] font-medium text-coffee-400 capitalize">{user.role}</span>
              </div>
              <div className="p-1.5 bg-coffee-900 rounded-full border border-coffee-800">
                <User className="w-4 h-4 text-coffee-300" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-coffee-400 hover:text-red-400 rounded-lg hover:bg-coffee-900/50 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-coffee-800/80">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-coffee-300 hover:text-coffee-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold bg-coffee-500 text-coffee-950 hover:bg-coffee-400 transition-all duration-200 px-3 sm:px-4 py-1.5 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center ml-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-coffee-300 hover:text-coffee-100 hover:bg-coffee-900 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-coffee-900/60 bg-coffee-950/95 mt-3 py-2 px-2 space-y-1 animate-fade-in rounded-b-xl">
          {(!user || user.role === 'customer') && (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-coffee-900 transition-colors ${
                isActive('/') ? 'text-coffee-400 bg-coffee-900/50' : 'text-coffee-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          )}

          {user && user.role === 'customer' && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-coffee-900 transition-colors ${
                isActive('/orders') ? 'text-coffee-400 bg-coffee-900/50' : 'text-coffee-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              My Orders
            </Link>
          )}

          {user && user.role === 'owner' && (
            <Link
              to="/owner-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-coffee-900 transition-colors ${
                isActive('/owner-dashboard') ? 'text-coffee-400 bg-coffee-900/50' : 'text-coffee-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Owner Dashboard
            </Link>
          )}

          {user && user.role === 'supplier' && (
            <Link
              to="/supplier-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-coffee-900 transition-colors ${
                isActive('/supplier-dashboard') ? 'text-coffee-400 bg-coffee-900/50' : 'text-coffee-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Supplier Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
