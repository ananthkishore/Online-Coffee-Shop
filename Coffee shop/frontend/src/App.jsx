import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Components
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import CartDrawer from './components/Cart/CartDrawer';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopDetails from './pages/ShopDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import CustomerOrders from './pages/CustomerOrders';
import OwnerDashboard from './pages/OwnerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-coffee-50/20">
            {/* Navigation Header */}
            <Navbar onCartClick={() => setCartOpen(true)} />

            {/* Shopping Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            {/* Main Application Routes */}
            <div className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/shop/:id" element={<ShopDetails />} />

                {/* Customer Guarded Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Guarded Routes */}
                <Route
                  path="/owner-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Supplier Guarded Routes */}
                <Route
                  path="/supplier-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback routing */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
