'use client';

import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function Navbar({ session }) {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎾</span>
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-poppins whitespace-nowrap"
            >
              East End Racquet Club
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Play
            </Link>
            {session ? (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Profile
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}