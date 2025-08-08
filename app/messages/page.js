'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/navbar'
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolid } from '@heroicons/react/24/solid'

const ConversationCard = ({ conversation, currentUserId, onClick }) => {
  const otherUser = conversation.from_user_id === currentUserId ? conversation.to_user : conversation.from_user
  const isUnread = !conversation.read && conversation.from_user_id !== currentUserId
  const lastMessage = conversation.content || 'No messages yet'
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200 cursor-pointer hover:border-green-200"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {isUnread && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <ExclamationCircleIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {otherUser?.name || 'Unknown User'}
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {formatTime(conversation.created_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
              {lastMessage}
            </p>
            
            {!isUnread && conversation.from_user_id === currentUserId && (
              <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>📍 {otherUser?.town}</span>
            <span>🏆 Level {otherUser?.skill}</span>
            <span>{otherUser?.sport === 'tennis' ? '🎾' : otherUser?.sport === 'pickleball' ? '🏓' : '🎾🏓'} {otherUser?.sport}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth')
          return
        }

        // Get current user profile
        const { data: currentUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setCurrentUser(currentUserData)

        // Fetch conversations - get latest message from each conversation
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`
            *,
            from_user:profiles!messages_from_user_id_fkey(*),
            to_user:profiles!messages_to_user_id_fkey(*)
          `)
          .or(`from_user_id.eq.${session.user.id},to_user_id.eq.${session.user.id}`)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Group messages by conversation and keep only the latest message
        const conversationsMap = new Map()
        
        messagesData?.forEach(message => {
          const otherUserId = message.from_user_id === session.user.id 
            ? message.to_user_id 
            : message.from_user_id
          
          const conversationKey = [session.user.id, otherUserId].sort().join('-')
          
          if (!conversationsMap.has(conversationKey)) {
            conversationsMap.set(conversationKey, message)
          }
        })

        setConversations(Array.from(conversationsMap.values()))
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        () => {
          fetchData() // Refetch on any message change
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleConversationClick = (conversation) => {
    const otherUserId = conversation.from_user_id === currentUser.id 
      ? conversation.to_user_id 
      : conversation.from_user_id
    
    router.push(`/messages/${otherUserId}`)
  }

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.from_user_id === currentUser?.id ? conv.to_user : conv.from_user
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <ChatBubbleLeftRightSolid className="w-10 h-10 text-green-500" />
              Messages
            </h1>
            <p className="text-lg text-gray-600">Stay connected with your playing partners</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg mb-6 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Conversations List */}
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'Start connecting with players to begin conversations'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/play')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Find Players
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map(conversation => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUser.id}
                  onClick={() => handleConversationClick(conversation)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}