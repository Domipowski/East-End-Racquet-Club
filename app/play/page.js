'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/navbar'
import { 
  FunnelIcon, 
  MapPinIcon, 
  TrophyIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

// Filter Panel Component
const FilterPanel = ({ 
  filters, 
  setFilters, 
  currentUser, 
  suffolkTowns, 
  isExpanded, 
  setIsExpanded 
}) => {
  const clearFilters = () => {
    setFilters({
      town: '',
      skillRange: [1, Math.min(10, currentUser.skill + 3)],
      sports: [],
      search: ''
    })
  }

  const handleSportToggle = (sport) => {
    setFilters(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }))
  }

  const activeFiltersCount = [
    filters.town,
    filters.search,
    filters.sports.length > 0,
    filters.skillRange[0] > 1 || filters.skillRange[1] < Math.min(10, currentUser.skill + 3)
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`p-4 ${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Players
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
              />
            </div>
          </div>

          {/* Town Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={filters.town}
              onChange={(e) => setFilters(prev => ({ ...prev, town: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer text-gray-700"
            >
              <option value="">All towns</option>
              {currentUser?.town && (
                <option value={currentUser.town}>🏠 Your town ({currentUser.town})</option>
              )}
              {suffolkTowns.map(town => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>

          {/* Skill Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level ({filters.skillRange[0]} - {filters.skillRange[1]})
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium min-w-[30px]">Min</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.skillRange[0]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    skillRange: [parseInt(e.target.value), prev.skillRange[1]]
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium min-w-[30px]">Max</span>
                <input
                  type="range"
                  min="1"
                  max={currentUser?.skill ? Math.min(10, currentUser.skill + 3) : 10}
                  value={filters.skillRange[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    skillRange: [prev.skillRange[0], parseInt(e.target.value)]
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>
          </div>

          {/* Sport Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sports
            </label>
            <div className="space-y-2">
              {[
                { value: 'tennis', label: '🎾 Tennis' },
                { value: 'pickleball', label: '🏓 Pickleball' },
                { value: 'both', label: '🎾🏓 Both' }
              ].map(sport => (
                <label key={sport.value} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer group hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-700 font-medium">{sport.label}</span>
                  
                  {/* Custom Toggle Switch */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.sports.includes(sport.value)}
                      onChange={() => handleSportToggle(sport.value)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-200 relative ${
                      filters.sports.includes(sport.value)
                        ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                        : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                        filters.sports.includes(sport.value) ? 'translate-x-5' : 'translate-x-0.5'
                      }`}>
                        {filters.sports.includes(sport.value) && (
                          <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// User Card Component
const UserCard = ({ user, viewMode }) => {
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

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.town}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrophyIcon className="w-4 h-4" />
                    <span>Level {user.skill}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{getSportDisplay(user.sport)}</span>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Card view
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">
            {getInitials(user.name)}
          </div>
          <div className="text-white flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{user.name}</h3>
            <div className="flex items-center gap-1 text-green-100">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm truncate">{user.town}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Skill Level */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Skill Level</span>
            <span className="text-lg font-bold text-green-600">{user.skill}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(user.skill / 10) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{getSkillLevel(user.skill)}</p>
        </div>

        {/* Sport */}
        <div className="text-center">
          <span className="text-lg font-semibold">{getSportDisplay(user.sport)}</span>
        </div>

        {/* Connect Button */}
        <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-2 rounded-lg font-semibold transition-colors">
          Connect
        </button>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('card') // 'card' or 'list'
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const router = useRouter()

  const [filters, setFilters] = useState({
    town: '',
    skillRange: [1, 10],
    sports: [],
    search: ''
  })
  
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

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/signin')
                    return
                }

                // Get current user profile
                const { data: currentUserData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                setCurrentUser(currentUserData)

                // Fetch active users (excluding current user)
                const { data: usersData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('active', true)
                    .neq('id', session.user.id)
                    .order('name')

                if (error) throw error
                setUsers(usersData || [])
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    // 2. Set filters once currentUser is available
    useEffect(() => {
        if (currentUser) {
            setFilters({
                town: '',
                skillRange: [1, Math.min(10, currentUser.skill + 3)],
                sports: [],
                search: ''
            })
        }
    }, [currentUser])

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (filters.search && !user.name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Town filter
      if (filters.town && user.town !== filters.town) {
        return false
      }

      // Skill range filter
      if (user.skill < filters.skillRange[0] || user.skill > filters.skillRange[1]) {
        return false
      }

      // Sport filter
      if (filters.sports.length > 0 && !filters.sports.includes(user.sport)) {
        return false
      }

      return true
    })
  }, [users, filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Playing Partners</h1>
            <p className="text-lg text-gray-600">Connect with active players in your area</p>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            currentUser={currentUser}
            suffolkTowns={suffolkTowns}
            isExpanded={isFilterExpanded}
            setIsExpanded={setIsFilterExpanded}
          />

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Active Players
              </h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                {filteredUsers.length} found
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 hidden sm:block">View:</span>
              <div className="relative flex bg-gray-100 rounded-lg p-1">
                {/* Animated Background */}
                <div 
                  className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-green-500 to-blue-500 rounded-md shadow-sm transition-transform duration-300 ease-in-out ${
                    viewMode === 'list' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                ></div>
                
                <button
                  onClick={() => setViewMode('card')}
                  className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
                    viewMode === 'card' 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
                    viewMode === 'list' 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Grid/List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎾</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No players found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
              <button
                onClick={() => setFilters({
                  town: '',
                  skillRange: [1, 10],
                  sports: [],
                  search: ''
                })}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'card'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredUsers.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}