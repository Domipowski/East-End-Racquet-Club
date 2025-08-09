'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/navbar'

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        // (optional) ensure profile exists, then:
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        const needs = !profile || !profile.onboarding_completed;
        router.replace(needs ? '/onboarding' : '/');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`
          }
        })
        
        if (error) throw error
        
        // Show verification screen
        setShowVerification(true)
        setResendTimer(60) // 60 second cooldown
        setMessage('Please check your email for the 6-digit verification code')
        
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        // Check if user needs onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()
        
        if (profile && !profile.onboarding_completed) {
          router.push('/onboarding')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      })

      if (error) throw error

      // Successfully verified, redirect to onboarding
      router.push('/onboarding')
      
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMessage('New verification code sent!')
      setResendTimer(60)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      
    } catch (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {!showVerification ? (
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-lg text-gray-600">
                  {isSignUp 
                    ? 'Join the East End Racquet Club community' 
                    : 'Sign in to find your perfect tennis partner'
                  }
                </p>
              </div>

              {/* Auth Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Toggle Sign In/Sign Up */}
                <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
                  {/* Animated Background */}
                  <div 
                    className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-green-500 to-blue-500 rounded-md shadow-sm transition-transform duration-300 ease-in-out ${
                      isSignUp ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  ></div>
                  
                  <button
                    onClick={() => {
                      setIsSignUp(false)
                      setMessage('')
                    }}
                    className={`relative z-10 flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-300 cursor-pointer ${
                      !isSignUp 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsSignUp(true)
                      setMessage('')
                    }}
                    className={`relative z-10 flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-300 cursor-pointer ${
                      isSignUp 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="on"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 text-gray-700"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 text-gray-700"
                      placeholder="••••••••"
                    />
                    {isSignUp && (
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-colors shadow-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </form>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    message.includes('verification code') || message.includes('New verification') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Footer Links */}
                <div className="mt-2 text-center">
                  {!isSignUp && (
                    <Link 
                      href="/forgot-password"
                      className="text-sm text-green-600 hover:text-green-800 underline cursor-pointer"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                
                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm mt-4 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </>
          ) : (
            /* Verification Screen */
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Check Your Email
                </h1>
                <p className="text-lg text-gray-600">
                  We sent a 6-digit code to <span className="font-semibold">{email}</span>
                </p>
              </div>

              {/* Verification Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleVerification} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Enter Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-colors shadow-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>

                {/* Resend Code */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">{"Didn't"} receive the code?</p>
                  <button
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm text-green-600 hover:text-green-800 underline cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>

                {/* Back Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer"
                  >
                    ← Back to Sign Up
                  </button>
                </div>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    message.includes('New verification') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-800 underline cursor-pointer"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}