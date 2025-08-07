'use client'

import Link from 'next/link'
import { supabase } from '../lib/supabase'

import Navbar from './components/navbar'
import Carousel from './components/carousel'
import { useUser } from './components/user_provider';

export default function Home() {
  const { session, loading } = useUser();

  if (loading) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar/>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Find Your Perfect Partner
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Connect with tennis and pickleball players in Suffolk County
            </p>
          </div>

          <Carousel/>

          {/* Action Buttons */}
          <div className="space-y-4">
            {session ? (
              // Logged in state
              <div className="space-y-4">
                <p className="text-lg text-gray-700 mb-4">
                  Welcome back! Ready to find some players?
                </p>
                <Link 
                  href="/search"
                  className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-102 hover:shadow-xl hover:from-green-600 hover:to-blue-600"
                >
                  🔍 Search for Players
                </Link>
                <div>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-gray-600 hover:text-green-600 underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Not logged in state
              <div className="space-y-4">
                <Link 
                  href="/auth"
                  className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  Get Started - Sign Up
                </Link>
                <div>
                  <Link 
                    href="/auth"
                    className="text-green-600 hover:text-green-800 underline font-medium"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">Play</div>
              <div className="text-sm text-gray-600">Tennis & Pickleball</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">1-10</div>
              <div className="text-sm text-gray-600">Skill Levels</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">31</div>
              <div className="text-sm text-gray-600">Suffolk Towns</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">350+</div>
              <div className="text-sm text-gray-600">Players Joined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}