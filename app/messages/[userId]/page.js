'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Navbar from '../../components/navbar'
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserIcon,
  MapPinIcon,
  TrophyIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const MessageBubble = ({ message, isCurrentUser, showAvatar = false, otherUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex items-end gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          isCurrentUser ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isCurrentUser && message.read && (
            <CheckCircleIcon className="w-3 h-3" />
          )}
          {isCurrentUser && !message.read && (
            <CheckIcon className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  )
}

const UserInfoHeader = ({ user, onBack }) => {
  const getSportDisplay = (sport) => {
    switch (sport) {
      case 'tennis': return '🎾 Tennis'
      case 'pickleball': return '🏓 Pickleball'
      case 'both': return '🎾🏓 Both'
      default: return sport
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">{user?.name || 'Unknown User'}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              <span>{user?.town}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrophyIcon className="w-3 h-3" />
              <span>Skill Level: {user?.skill}</span>
            </div>
            <span>{getSportDisplay(user?.sport)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const params = useParams()
  const otherUserId = params.userId
  const currentUserId = currentUser ? currentUser.id : null; // stable primitive

  const handleBack = () => {
    router.push('/messages'); // make sure you have a /messages index page
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

        // Get other user profile
        const { data: otherUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single()

        setOtherUser(otherUserData)

        // Fetch messages between users
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(from_user_id.eq.${session.user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${session.user.id})`)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(messagesData || [])

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('from_user_id', otherUserId)
          .eq('to_user_id', session.user.id)
          .eq('read', false)

      } catch (error) {
        console.error('Error fetching chat data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (otherUserId) {
      fetchData()
    }
  }, [otherUserId, router])

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const handleInsert = (payload) => {
      const m = payload.new;

      const isThisThread =
        (m.from_user_id === currentUserId && m.to_user_id === otherUserId) ||
        (m.from_user_id === otherUserId && m.to_user_id === currentUserId);

      if (!isThisThread) return;

      setMessages(prev => [...prev, m]);

      // mark as read if the other user sent it
      if (m.from_user_id === otherUserId) {
        supabase.from('messages').update({ read: true }).eq('id', m.id);
      }
    };

    // two simple subscriptions — each watches one column
    const channel = supabase
      .channel(`chat-${currentUserId}-${otherUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `from_user_id=eq.${currentUserId}` },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${currentUserId}` },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: otherUserId,
          content: newMessage.trim(),
          read: false
        })
        .select()
        .single(); // get the inserted row back

      if (error) throw error;

      // show it right away
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <UserInfoHeader user={otherUser} onBack={handleBack} />
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-1">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-gray-500">Start your conversation with {otherUser?.name}</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.from_user_id === currentUser.id
                const prevMessage = messages[index - 1]
                const showAvatar = !prevMessage || 
                  prevMessage.from_user_id !== message.from_user_id ||
                  (new Date(message.created_at) - new Date(prevMessage.created_at)) > 300000 // 5 minutes
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    otherUser={otherUser}
                  />
                )
              })
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <div className="flex-1">
              <textarea
                id="textfield"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-700"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="mb-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}