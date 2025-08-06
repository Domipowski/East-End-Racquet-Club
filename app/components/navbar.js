'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Bars3Icon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useUser } from '../user_provider';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useUser();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-4">
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

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-700"
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <ChevronUpIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Navigation Links */}
          <div
            className={`
              w-full sm:w-auto
              overflow-hidden transition-all duration-300 ease-in-out
              ${menuOpen ? 'max-h-20 mt-4' : 'max-h-0 sm:max-h-full sm:mt-0'}
            `}
          >
            <div className="flex justify-center  items-center gap-x-4 sm:gap-x-6">
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
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}