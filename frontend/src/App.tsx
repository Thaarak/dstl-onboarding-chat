import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8100';

type Message = {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  conversation_id?: number;
};

type Conversation = {
  id: number;
  title: string | null;
  created_at: string;
  messages: Message[];
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadConversation = async (conversationId: number) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`);
    const data: Conversation = await response.json();
    setMessages(data.messages);
    setSelectedConversationId(conversationId);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const content = input;
    setInput('');

    if (selectedConversationId === null) {
      // Create new conversation
      const convResponse = await fetch(`${API_BASE_URL}/conversations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: null })
      });
      const newConv: Conversation = await convResponse.json();
      setSelectedConversationId(newConv.id);
      setConversations((prev) => [...prev, newConv]);

      // Create message in new conversation
      const msgResponse = await fetch(`${API_BASE_URL}/conversations/${newConv.id}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user' })
      });
      const newMsg: Message = await msgResponse.json();
      setMessages([newMsg]);
    } else {
      // Add message to existing conversation
      const msgResponse = await fetch(`${API_BASE_URL}/conversations/${selectedConversationId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user' })
      });
      const newMsg: Message = await msgResponse.json();
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-900 text-white p-4 flex flex-col'>
        <div className='mb-4'>
          <h1 className='text-xl font-bold'>DSTL Chat App</h1>
        </div>
        <button
          className='w-full py-2 px-4 border border-gray-600 rounded hover:bg-gray-800 text-left mb-4'
          onClick={() => {
            setMessages([]);
            setSelectedConversationId(null);
          }}
        >
          + New Chat
        </button>
        <div className='flex-1 overflow-y-auto'>
          {conversations.length === 0 ? (
            <div className='text-sm text-gray-400'>No conversations yet</div>
          ) : (
            <div className='space-y-2'>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className='w-full text-left p-3 rounded hover:bg-gray-800'
                >
                  <div className='text-sm font-medium truncate'>
                    {conv.title || `Conversation ${conv.id}`}
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='text-center text-gray-500 mt-20'>
              <h2 className='text-2xl font-semibold'>
                Welcome to the DSTL Chat App
              </h2>
              <p>Start a conversation!</p>
            </div>
          ) : (
              messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className='p-4 border-t border-gray-200 bg-white'>
          <div className='flex gap-4 max-w-4xl mx-auto'>
            <textarea
              className='flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={1}
              placeholder='Type a message...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50'
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
          <div className='text-center text-xs text-gray-400 mt-2'>
            Press Enter to send
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
