import React from 'react';
import { Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-coffee-950 border-t border-coffee-900/60 py-10 text-coffee-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-coffee-900 rounded-lg">
              <Coffee className="w-5 h-5 text-coffee-400" />
            </div>
            <span className="font-extrabold text-lg text-coffee-100 tracking-wide">
              AromaStream
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="hover:text-coffee-300 transition-colors cursor-pointer">About Us</span>
            <span className="hover:text-coffee-300 transition-colors cursor-pointer">Contact Support</span>
            <span className="hover:text-coffee-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-coffee-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>

          <p className="text-xs text-coffee-500 text-center">
            &copy; {new Date().getFullYear()} AromaStream Inc. Crafted for coffee lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
