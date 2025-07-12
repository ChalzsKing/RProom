"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { ModelParameters } from './model-parameters';
import { CustomGptSelector } from './custom-gpt-selector';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ChatWindow() {
  const { activeProvider, activeProject, activeGpt, currentPreset, messages, addMessage, clearMessages } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userMessageContent = inputMessage;
      addMessage('user', userMessageContent);
      setInputMessage('');
      setIsThinking(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: userMessageContent }],
            temperature: currentPreset.temperature,
            maxLength: currentPreset.maxLength,
            tone: currentPreset.tone,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener respuesta de la IA');
        }

        const data = await response.json();
        addMessage('assistant', data.message);
      } catch (error: any) {
        console.error('Error al enviar mensaje:', error);
        toast.error(`Error: ${error.message}`);
        addMessage('assistant', 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
      } finally {
        setIsThinking(false);
      }
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setInputMessage('');
    setIsThinking(false);
    toast.info('Nuevo chat iniciado.');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:h-[60px] lg:px-6">
        <h2 className="text-lg font-semibold">
          Chat con {activeProvider} - {activeProject}
        </h2>
        <div className="flex items-center gap-2">
          <CustomGptSelector />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Temp: {currentPreset.temperature} | Len: {currentPreset.maxLength} | Tono: {currentPreset.tone}
          </span>
          <ModelParameters />
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" onClick={handleNewChat}>
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Nuevo Chat</span>
          </Button>
        </div>
      </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col p-3 rounded-lg max-w-[80%] sm:max-w-[70%]",
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground self-end rounded-br-none'
                : 'bg-secondary text-secondary-foreground self-start rounded-bl-none'
            )}
          >
            <div className="font-bold mb-1">
              {msg.role === 'user' ? 'Tú:' : 'IA:'}
            </div>
            <div>{msg.content}</div>
            <div className="text-xs opacity-70 mt-2 text-right">
              {format(msg.timestamp, 'HH:mm:ss', { locale: es })}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex flex-col p-3 rounded-lg max-w-[80%] sm:max-w-[70%] bg-secondary text-secondary-foreground self-start rounded-bl-none animate-pulse">
            <div className="font-bold mb-1">IA:</div>
            <div>...pensando</div>
            <div className="text-xs opacity-70 mt-2 text-right">
              {format(new Date(), 'HH:mm:ss', { locale: es })}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex items-center gap-2">
        <Input
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-input text-foreground border-input focus-visible:ring-ring"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isThinking}
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isThinking}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}