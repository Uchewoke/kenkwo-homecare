import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function CaregiverMessaging() {
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const [connected, setConnected] = useState(false)
  const [joined, setJoined] = useState(false)

  const [userName, setUserName] = useState('')
  const [room, setRoom] = useState('')
  const [joinError, setJoinError] = useState('')

  const [messages, setMessages] = useState([])
  const [systemEvents, setSystemEvents] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const timeline = [...messages, ...systemEvents.map((event) => ({ ...event, isSystem: true }))]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  useEffect(() => {
    const socket = io(serverUrl, { autoConnect: false })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => {
      setConnected(false)
      setJoined(false)
    })

    socket.on('message_history', (history) => {
      setMessages(history)
    })

    socket.on('receive_message', (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return [...prev, message]
      })
    })

    socket.on('system_event', (event) => {
      setSystemEvents((prev) => [...prev, event])
    })

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [timeline])

  const handleJoin = (event) => {
    event.preventDefault()
    const trimmedName = userName.trim()
    const trimmedRoom = room.trim()
    if (!trimmedName || !trimmedRoom) {
      setJoinError('Please enter your name and a room name.')
      return
    }
    setJoinError('')
    socketRef.current.emit('join_room', { room: trimmedRoom, userName: trimmedName })
    setJoined(true)
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    socketRef.current.emit('send_message', { room, text, userName })
    setInput('')
    setSending(false)
  }

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <section id="messaging" className="py-24 bg-slate-900/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">
            Caregiver Messaging
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Real-Time Care Coordination</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Caregivers and coordinators communicate instantly in secure, dedicated rooms.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Secure Messaging</h3>
              {joined && (
                <p className="text-xs text-blue-100">
                  Room: <span className="font-medium">{room}</span> · as{' '}
                  <span className="font-medium">{userName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className={connected ? 'text-green-200' : 'text-red-200'}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {!joined ? (
            <form onSubmit={handleJoin} className="p-8 space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Your Name</label>
                <input
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  placeholder="e.g. Nurse Williams"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Room / Patient ID</label>
                <input
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="e.g. patient-smith-101"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition"
                />
              </div>
              {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
              <button
                type="submit"
                disabled={!connected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-semibold transition"
              >
                {connected ? 'Join Room' : 'Connecting…'}
              </button>
            </form>
          ) : (
            <>
              <div className="h-[380px] overflow-y-auto p-5 space-y-3 bg-slate-950">
                {timeline.length === 0 && (
                  <p className="text-center text-slate-600 text-sm mt-16">
                    No messages yet. Start the conversation.
                  </p>
                )}

                {timeline.map((item, index) =>
                  item.isSystem ? (
                    <div key={index} className="flex justify-center">
                      <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full">
                        {item.text} · {formatTime(item.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={item.id ?? index}
                      className={`flex flex-col ${
                        item.userName === userName ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-xs text-slate-500 mb-1 px-1">
                        {item.userName} · {formatTime(item.timestamp)}
                      </span>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          item.userName === userName
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ),
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-800 flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type a message…"
                  className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 rounded-xl font-medium text-sm transition"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}