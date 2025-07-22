
"use client";

import React, { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function ChatWindow() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const getChatKey = () => currentUser ? `chat_history_${currentUser.email}` : 'chat_history_guest';

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // Save the updated messages list to localStorage after the AI responds.
      const updatedMessages = [...messages, message];
      localStorage.setItem(getChatKey(), JSON.stringify(updatedMessages));
    },
    onError: (error) => {
       console.error("Chat error:", error);
       // Handle chat errors if needed
    }
  });

  // Load messages from localStorage on initial render
  useEffect(() => {
    const storedMessages = localStorage.getItem(getChatKey());
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, setMessages]); // Depend on currentUser to load history for the logged-in user

  // Save user messages immediately for a better UX, even if the AI fails.
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(getChatKey(), JSON.stringify(messages));
    }
  }, [messages, currentUser]);


  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };


  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground pt-12">
              <MessageSquare className="mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold mt-4">{t('chat.title', 'Assistente Virtual IA')}</h3>
              <p className="text-sm">{t('chat.description', 'Converse com nosso assistente para tirar dúvidas sobre o sistema, sensores ou o cultivo de cacau.')}</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-3",
                m.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {m.role === 'assistant' && (
                <Avatar className="h-9 w-9">
                   <AvatarImage src="https://placehold.co/100x100/38A169/FFFFFF/png" alt="AI" data-ai-hint="logo"/>
                   <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-md rounded-lg px-4 py-3 text-sm",
                  m.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                 <Avatar className="h-9 w-9">
                   <AvatarFallback>{currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                 </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100/38A169/FFFFFF/png" alt="AI" data-ai-hint="logo"/>
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3 text-sm flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background/80 rounded-b-lg">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2"
        >
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
