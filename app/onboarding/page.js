'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/navbar'

export default function Onboarding() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [skill, setSkill] = useState('')
  const [sport, setSport] = useState('')
  const [town, setTown] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const suffolkTowns = [
    'Amityville', 'Babylon', 'Bay Shore', 'Bellport', 'Brentwood', 
    'Brookhaven', 'Center Moriches', 'Central Islip', 'Commack', 
    'Copiague', 'Deer Park', 'East Hampton', 'East Islip', 'East Northport',
    'Farmingdale', 'Farmingville', 'Fire Island', 'Greenlawn', 'Hampton Bays',
    'Hauppauge', 'Holbrook', 'Holtsville', 'Huntington', 'Huntington Station',
    'Islip', 'Kings Park', 'Lake Grove', 'Lindenhurst', 'Long Beach',
    'Massapequa', 'Massapequa Park', 'Medford', 'Melville', 'Middle Island',
    'Miller Place', 'Montauk', 'Mount Sinai', 'Nesconset', 'North Babylon',
    'Northport', 'Oakdale', 'Patchogue', 'Port Jefferson', 'Riverhead',
    'Rocky Point', 'Ronkonkoma', 'Sag Harbor', 'Sayville', 'Selden',
    'Shelter Island', 'Shirley', 'Smithtown', 'Southampton', 'Southold',
    'St. James', 'Stony Brook', 'Suffolk County', 'West Babylon', 'West Islip',
    'West Sayville', 'Westhampton', 'Wyandanch', 'Yaphank'
  ].sort()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      setUser(session.user)
      
      // Check if user already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile && profile.onboarding_completed) {
        router.push('/')
        return
      }
      
      // Pre-fill name if available
      if (profile?.name) {
        setName(profile.name)
      } else if (session.user.user_metadata?.name) {
        setName(session.user.user_metadata.name)
      }
    }
    
    getUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: name.trim(),
          skill: parseInt(skill),
          sport,
          town,
          onboarding_completed: true
        })

      if (error) throw error

      router.push('/')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return name.trim().length > 0
      case 2: return skill !== ''
      case 3: return sport !== ''
      case 4: return town !== ''
      default: return false
    }
  }

  const isComplete = name.trim() && skill && sport && town

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome to the Club!
            </h1>
            <p className="text-lg text-gray-600">
              {"Let's"} set up your profile to find the perfect playing partners
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Onboarding Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Name */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">{"What's"} your name?</h2>
                    <p className="text-gray-600">This is how other players will see you</p>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 text-lg text-gray-700"
                      placeholder="Enter your full name"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Skill Level */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">{"What's"} your skill level?</h2>
                    <p className="text-gray-600">Rate yourself from 1 (beginner) to 10 (expert)</p>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSkill(level.toString())}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          skill === level.toString()
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-xl font-bold">{level}</div>
                      </button>
                    ))}
                  </div>

                </div>
              )}

              {/* Step 3: Sport */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">What do you play?</h2>
                    <p className="text-gray-600">Choose your preferred sport</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'tennis', label: '🎾 Tennis', desc: 'The classic racquet sport' },
                      { value: 'pickleball', label: '🏓 Pickleball', desc: 'Fast-growing paddle sport' },
                      { value: 'both', label: '🎾🏓 Both', desc: 'I play tennis and pickleball' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSport(option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                          sport === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Town */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Where are you located?</h2>
                    <p className="text-gray-600">Select your Suffolk County town</p>
                  </div>
                  
                  <div>
                    <select
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg cursor-pointer text-gray-700"
                    >
                      <option value="">Select your town...</option>
                      {suffolkTowns.map((townName) => (
                        <option key={townName} value={townName}>
                          {townName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ← Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      canProceed()
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isComplete || loading}
                    className={`px-8 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                      isComplete && !loading
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Creating Profile...' : 'Complete Setup 🎉'}
                  </button>
                )}
              </div>
            </form>

            {/* Error Message */}
            {message && (
              <div className="mt-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}