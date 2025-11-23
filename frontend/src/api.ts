const API_BASE_URL = 'http://localhost:8100';

export type Message = {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
};

export type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

export const api = {
  /**
   * Fetch all conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/conversations/`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return response.json();
  },

  /**
   * Load messages for a specific conversation
   */
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
    );
    if (!response.ok) {
      throw new Error('Failed to load conversation messages');
    }
    return response.json();
  },

  /**
   * Create a new conversation
   */
  async createConversation(title: string | null): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
  },

  /**
   * Update a conversation
   */
  async updateConversation(
    conversationId: number,
    conversation: Conversation,
  ): Promise<Conversation> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }
    return response.json();
  },

  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: number,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<Message> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },
};
