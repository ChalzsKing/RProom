import React from 'react';
import { SidebarNav } from './sidebar-nav';
import { ChatWindow } from './chat-window';

export default function MatrixChatLayout() {
  return (
    <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
      <SidebarNav />
      <ChatWindow />
    </div>
  );
}