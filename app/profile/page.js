'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/navbar'
import { PencilIcon, MapPinIcon, TrophyIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editForm, setEditForm] = useState({})
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
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth')
          return
        }

        setUser(session.user)

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        setProfile(profileData)
        setEditForm(profileData)
      } catch (error) {
        console.error('Error loading profile:', error)
        setMessage('Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          skill: editForm.skill,
          sport: editForm.sport,
          town: editForm.town,
          active: editForm.active
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, ...editForm })
      setEditing(false)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getSkillLevel = (skill) => {
    if (skill <= 2) return 'Beginner'
    if (skill <= 4) return 'Novice'
    if (skill <= 6) return 'Intermediate'
    if (skill <= 8) return 'Advanced'
    return 'Expert'
  }

  const getSportDisplay = (sport) => {
    switch (sport) {
      case 'tennis': return '🎾 Tennis'
      case 'pickleball': return '🏓 Pickleball'
      case 'both': return '🎾🏓 Both'
      default: return sport
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile not found</h1>
          <p className="text-gray-600 mb-6">Complete your profile to get started</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-colors cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Profile</h1>
            <p className="text-lg text-gray-600">Manage your tennis partner profile</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-green-600 shadow-lg">
                  {getInitials(profile.name)}
                </div>
                
                {/* Basic Info */}
                <div className="text-center sm:text-left text-white flex-1">
                  <h2 className="text-3xl font-bold mb-2">{profile.name || 'Unnamed Player'}</h2>
                  <div className="flex flex-col sm:flex-row gap-4 text-green-100">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{profile.town}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <TrophyIcon className="w-5 h-5" />
                      <span>Level {profile.skill} • {getSkillLevel(profile.skill)}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <PencilIcon className="w-4 h-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8">
              {!editing ? (
                /* View Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-green-600" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Email</span>
                          <span className="font-medium">{profile.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Name</span>
                          <span className="font-medium">{profile.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium">{profile.town}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Member Since</span>
                          <span className="font-medium">{formatDate(profile.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Looking for Partners</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-green-600" />
                        Playing Information
                      </h3>
                      <div className="space-y-4">
                        {/* Skill Level */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Skill Level</span>
                            <span className="text-2xl font-bold text-green-600">{profile.skill}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(profile.skill / 10) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{getSkillLevel(profile.skill)}</p>
                        </div>

                        {/* Sport */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-gray-600 block mb-2">Preferred Sport</span>
                          <span className="text-xl font-semibold">{getSportDisplay(profile.sport)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Town */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
                      <select
                        value={editForm.town || ''}
                        onChange={(e) => setEditForm({ ...editForm, town: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="">Select town...</option>
                        {suffolkTowns.map((town) => (
                          <option key={town} value={town}>{town}</option>
                        ))}
                      </select>
                    </div>

                    {/* Skill Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level (1-10)</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, skill: level })}
                            className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                              editForm.skill === level
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-lg font-bold">{level}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sport */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                      <div className="space-y-2">
                        {[
                          { value: 'tennis', label: '🎾 Tennis' },
                          { value: 'pickleball', label: '🏓 Pickleball' },
                          { value: 'both', label: '🎾🏓 Both' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, sport: option.value })}
                            className={`w-full p-3 rounded-lg border-2 transition-all cursor-pointer text-left ${
                              editForm.sport === option.value
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.active || false}
                          onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          I'm actively looking for playing partners
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setEditForm(profile)
                        setMessage('')
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/search')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-center"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-800 mb-1">Find Partners</h3>
              <p className="text-sm text-gray-600">Search for players in your area</p>
            </button>

            <button
              onClick={() => router.push('/messages')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-800 mb-1">Messages</h3>
              <p className="text-sm text-gray-600">Check your conversations</p>
            </button>

            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-center sm:col-span-2 lg:col-span-1"
            >
              <div className="text-2xl mb-2">🚪</div>
              <h3 className="font-semibold text-gray-800 mb-1">Sign Out</h3>
              <p className="text-sm text-gray-600">Log out of your account</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}