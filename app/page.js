'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

import Image from 'next/image'
import { MapPinIcon } from '@heroicons/react/24/solid'; 

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const slideInterval = useRef(null);

  const startSlideInterval = () => {
    clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
  };
  
  const carouselImages = [
    { 
      id: 1, 
      src: "/images/stotzky_court.jpg", 
      alt: "Riverhead Tennis", 
      park: "Stozky Park", 
      town: "Riverhead" 
    },
    { 
      id: 2, 
      src: "/images/four_sisters_park_patchogue_courts.jpg", 
      alt: "Patchogue Tennis", 
      park: "Four Sisters Park", 
      town: "Patchogue"
    },
    { 
      id: 3, 
      src: "/images/ronkonkoma_courts.webp", 
      alt: "Ronkonkoma Tennis", 
      park: "Beach and Recreation Center", 
      town: "Ronkonkoma" 
    },
    { 
      id: 4, 
      src: "/images/port_jeff_courts.webp", 
      alt: "Port Jefferson Tennis", 
      park: "Rocketship Park", 
      town: "Port Jefferson" 
    },
    { 
      id: 5, 
      src: "/images/herrick_park_east_hampton_courts.webp", 
      alt: "East Hampton Tennis", 
      park: "Herrick Park", 
      town: "East Hampton" 
    }
  ];  

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
    startSlideInterval();
    return () => clearInterval(slideInterval.current);
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
                <>
                  <Link
                    href="/signin"
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign In
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
            {/* Slide container (relative, responsive height) */}
            <div className="relative w-full aspect-[16/9]">
              {carouselImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute bottom-4 left-4 flex items-center gap-x-1 z-20 px-3 py-1 rounded-lg shadow bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <MapPinIcon className="w-5 h-5" />

                    <p className="text-sm font-bold">
                      {image.park}, {image.town}
                    </p>
                  </div>
                </div>
              ))}

              {/* Left Arrow */}
              <button
                onClick={() => {
                  setCurrentSlide((prev) =>
                    prev === 0 ? carouselImages.length - 1 : prev - 1
                  ); 
                  startSlideInterval(); 
                }}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full shadow z-20"
                aria-label="Previous Slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-black"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  setCurrentSlide((prev) =>
                    prev === carouselImages.length - 1 ? 0 : prev + 1
                  ); 
                  startSlideInterval(); 
                }}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full shadow z-20"
                aria-label="Next Slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-black"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Carousel Indicators — inside the aspect container */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-green-500' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
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
                  className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
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