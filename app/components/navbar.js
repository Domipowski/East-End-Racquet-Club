'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { supabase } from '../../lib/supabase';
import { Bars3Icon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useUser } from './user_provider';
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useUser();
  const router = useRouter();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-1">
            <span className="text-2xl">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={45}   
                height={45}
              />
            </span>

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
              ${menuOpen ? 'max-h-40 mt-4' : 'max-h-0 sm:max-h-full sm:mt-0'}
            `}
          >
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 sm:gap-x-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </Link>
              
              <Link href={session ? "/play" : "/auth"} className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Play
              </Link>
              {session ? (
                <>
                  <Link href="/messages" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                    Messages
                  </Link>

                  <Link href="/profile" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                    Profile
                  </Link>
                  
                  <button
                    onClick={() => { 
                      supabase.auth.signOut(); 
                      router.push('/'); 
                    }}
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