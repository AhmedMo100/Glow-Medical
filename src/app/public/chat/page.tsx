import type { Metadata } from 'next'
import ChatbotPage from '@/components/public/chatbot/ChatbotPage'

export const metadata: Metadata = {
  title: 'Ask Glow Assistant — AI Beauty Advisor',
  description:
    'Chat with Glow Medical\'s AI assistant for expert advice on aesthetic treatments, skincare routines, and beauty questions.',
}

export default function ChatPage() {
  return <ChatbotPage />
}
