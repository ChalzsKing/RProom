import React from 'react';
import { SidebarNav } from './sidebar-nav';
import { ChatWindow } from './chat-window';
import { ChatProvider } from '@/context/chat-context';

export default function MatrixChatLayout() {
  return (
    <ChatProvider>
      <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
        <SidebarNav />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}