import { useState, useEffect } from 'react';

type Message = {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
};

type Conversation = {
  id: number;
  title: string;
  created_at: string;
  messages?: Message[];
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:8100/conversations/');
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, []);

  const loadConversation = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:8100/conversations/${id}/messages`,
      );
      const data = await res.json();
      setMessages(data || []);
      setActiveConversationId(id);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Hard-coded response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'This is a hard-coded response.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
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
          onClick={handleNewChat}
        >
          + New Chat
        </button>
        <div className='flex-1 overflow-y-auto space-y-2'>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-800 ${
                activeConversationId === conv.id ? 'bg-gray-800' : ''
              }`}
              onClick={() => loadConversation(conv.id)}
            >
              {conv.title || `Conversation ${conv.id}`}
            </div>
          ))}
          {conversations.length === 0 && (
            <div className='text-sm text-gray-400'>No conversations yet</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.map((msg, index) => (
            <div
              key={index}
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
          ))}
          {messages.length === 0 && (
            <div className='text-center text-gray-500 mt-20'>
              <h2 className='text-2xl font-semibold'>
                Welcome to the DSTL Chat App
              </h2>
              <p>Start a conversation!</p>
            </div>
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
