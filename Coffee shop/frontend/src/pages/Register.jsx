import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // Default: customer
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') navigate('/owner-dashboard');
      else if (user.role === 'supplier') navigate('/supplier-dashboard');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, role, phone);
    setLoading(false);

    if (!result?.success) {
      setError(result?.message || 'Registration failed. Email might already be taken.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-coffee-950 via-coffee-900 to-coffee-950 text-coffee-100">
      
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-coffee-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-coffee-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-2xl shadow-lg mb-3">
            <Coffee className="w-8 h-8 text-coffee-950" />
          </div>
          <h2 className="text-3xl font-extrabold font-sans tracking-tight">Create Account</h2>
          <p className="text-sm text-coffee-400 mt-1.5">Join AromaStream to start ordering or selling fresh brew</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel-dark p-8 rounded-2xl shadow-xl border border-coffee-900/60">
          
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-semibold mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-coffee-300 uppercase tracking-wider mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-3 gap-2 bg-coffee-950/80 p-1 border border-coffee-800/60 rounded-xl">
                {[
                  { id: 'customer', label: 'Customer' },
                  { id: 'owner', label: 'Shop Owner' },
                  { id: 'supplier', label: 'Delivery Supplier' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRole(tab.id)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                      role === tab.id
                        ? 'bg-coffee-500 text-coffee-950 shadow-sm'
                        : 'text-coffee-400 hover:text-coffee-100 hover:bg-coffee-900/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-coffee-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-coffee-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-950/60 border border-coffee-800 rounded-xl text-sm text-coffee-100 placeholder-coffee-600 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-coffee-300 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-coffee-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-coffee-950/60 border border-coffee-800 rounded-xl text-sm text-coffee-100 placeholder-coffee-600 outline-none focus:border-coffee-500 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-coffee-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-coffee-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-coffee-950/60 border border-coffee-800 rounded-xl text-sm text-coffee-100 placeholder-coffee-600 outline-none focus:border-coffee-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-coffee-300 uppercase tracking-wider mb-2">
                Password (min. 6 chars)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-coffee-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-coffee-950/60 border border-coffee-800 rounded-xl text-sm text-coffee-100 placeholder-coffee-600 outline-none focus:border-coffee-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-500 hover:bg-coffee-600 text-coffee-950 font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] mt-2 disabled:bg-coffee-700/80 disabled:text-coffee-900"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs">
            <span className="text-coffee-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-coffee-400 hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
