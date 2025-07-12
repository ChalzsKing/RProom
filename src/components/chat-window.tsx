"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw } from 'lucide-react'; // Importar RefreshCw para el botón de nuevo chat
import { useChat } from '@/context/chat-context';
import { ModelParameters } from './model-parameters';
import { CustomGptSelector } from './custom-gpt-selector';
import { format } from 'date-fns'; // Importar format de date-fns
import { es } from 'date-fns/locale'; // Importar el locale español

export function ChatWindow() {
  const { activeProvider, activeProject, activeGpt, currentPreset, messages, addMessage, clearMessages } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false); // Nuevo estado para el indicador de IA
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]); // También desplazar si la IA está pensando

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      addMessage('user', inputMessage);
      setInputMessage('');
      setIsThinking(true); // La IA está pensando

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar un poco más para simular el pensamiento
      addMessage('assistant', `Entendido. Procesando tu solicitud con ${activeGpt.name} (Temp: ${currentPreset.temperature}, Len: ${currentPreset.maxLength}, Tono: ${currentPreset.tone}).`);
      setIsThinking(false); // La IA ha terminado de pensar
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setInputMessage('');
    setIsThinking(false);
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
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" onClick={handleNewChat}>
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Nuevo Chat</span>
          </Button>
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
              {format(msg.timestamp, 'HH:mm:ss', { locale: es })} {/* Formato de hora */}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="mb-4 p-2 rounded-md bg-secondary text-secondary-foreground mr-auto max-w-[70%] animate-pulse">
            <span className="font-bold">IA:</span> ...pensando
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex items-center gap-2">
        <Input
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-input text-foreground border-input focus-visible:ring-ring"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isThinking} // Deshabilitar input mientras la IA piensa
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isThinking}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}