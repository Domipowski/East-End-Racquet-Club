'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Placeholder images - you can replace these with your actual images
  const carouselImages = [
    { id: 1, alt: "Tennis Court 1" },
    { id: 2, alt: "Pickleball Court 1" },
    { id: 3, alt: "Tennis Court 2" },
    { id: 4, alt: "Community Players" },
    { id: 5, alt: "Court Complex" }
  ]

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [carouselImages.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎾</span>
              <Link href="/" className="text-2xl font-bold text-green-600 whitespace-nowrap">
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
                <>
                  <Link href="/signin" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
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

          {/* Image Carousel */}
          <div className="mb-12 relative bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-96">
              {carouselImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-r from-green-200 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {index % 2 === 0 ? '🎾' : '🏓'}
                      </div>
                      <p className="text-gray-700 font-medium">
                        {image.alt}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Image placeholder - Add your court photos here
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {session ? (
              // Logged in state
              <div className="space-y-4">
                <p className="text-lg text-gray-700 mb-6">
                  Welcome back! Ready to find some players?
                </p>
                <Link 
                  href="/search"
                  className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  🔍 Search for Players
                </Link>
                <div className="mt-4">
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Not logged in state
              <div className="space-y-4">
                <Link 
                  href="/signup"
                  className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  Get Started - Sign Up
                </Link>
                <div>
                  <Link 
                    href="/signin"
                    className="text-green-600 hover:text-green-800 underline font-medium"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">19</div>
              <div className="text-sm text-gray-600">Suffolk Towns</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">Play</div>
              <div className="text-sm text-gray-600">Tennis & Pickleball</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">350+</div>
              <div className="text-sm text-gray-600">Players Joined</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">1-10</div>
              <div className="text-sm text-gray-600">Skill Levels</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}