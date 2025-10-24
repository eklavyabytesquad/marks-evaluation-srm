'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">AM</span>
            </div>
            <div className="text-white hidden sm:block">
              <span className="font-bold text-lg">AutoMetric</span>
              <p className="text-xs text-blue-100">Mark Statement Generator</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-white hover:text-cyan-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="#features" 
              className="text-white hover:text-cyan-200 transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="/login" 
              className="text-white hover:text-cyan-200 transition-colors font-medium"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-white text-indigo-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-white hover:text-cyan-200 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#features" 
                className="text-white hover:text-cyan-200 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/login" 
                className="text-white hover:text-cyan-200 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-white text-indigo-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-md text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
