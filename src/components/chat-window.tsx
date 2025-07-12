"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { ModelParameters } from './model-parameters';
import { CustomGptSelector } from './custom-gpt-selector';

export function ChatWindow() {
  const { activeProvider, activeProject, activeGpt, currentPreset, messages, addMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      addMessage('user', inputMessage);
      setInputMessage('');

      // Simulate AI response
      setTimeout(() => {
        addMessage('assistant', `Entendido. Procesando tu solicitud con ${activeGpt.name} (Temp: ${currentPreset.temperature}, Len: ${currentPreset.maxLength}, Tono: ${currentPreset.tone}).`);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:h-[60px] lg:px-6">
        <h2 className="text-lg font-semibold">
          Chat con {activeProvider} - {activeProject}
        </h2>
        <div className="flex items-center gap-2">
          <CustomGptSelector />
          <span className="text-xs text-muted-foreground">
            Temp: {currentPreset.temperature} | Len: {currentPreset.maxLength} | Tono: {currentPreset.tone}
          </span>
          <ModelParameters />
        </div>
      </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 p-2 rounded-md ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground text-right ml-auto max-w-[70%]'
                : 'bg-secondary text-secondary-foreground mr-auto max-w-[70%]'
            }`}
          >
            <span className="font-bold">{msg.role === 'user' ? 'Tú:' : 'IA:'}</span> {msg.content}
            <div className="text-xs opacity-70 mt-1">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex items-center gap-2">
        <Input
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-input text-foreground border-input focus-visible:ring-ring"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}