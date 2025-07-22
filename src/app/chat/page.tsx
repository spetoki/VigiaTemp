
"use client";

import React from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSettings } from '@/context/SettingsContext';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { t } = useSettings();

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
       <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <MessageSquare className="mr-3 h-8 w-8" />
          {t('chat.title', 'Assistente Virtual IA')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('chat.description', 'Converse com nosso assistente para tirar dúvidas sobre o sistema, sensores ou o cultivo de cacau.')}
        </p>
      </div>
      <ChatWindow />
    </div>
  );
}
