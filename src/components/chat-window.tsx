"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw, User, Users, Dice5 } from 'lucide-react';
import { useChat } from '@/context/chat-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, rollD5 } from '@/lib/utils';
import { toast } from 'sonner';
import { ThemeSwitcher } from './theme-switcher';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManageScene } from './manage-scene';
import { getCharacterColor } from '@/lib/color-utils';

export function ChatWindow() {
  const {
    activeProvider, getActiveSession, getActiveAdventure, getActiveCampaign,
    messages, addMessage, clearMessages, activeNarrator, playerCharacters,
    activeSessionId, sceneStates, campaignNpcs
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState('dm'); // 'dm' for the Dungeon Master/Narrator
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const activeSession = getActiveSession();
  const activeAdventure = getActiveAdventure();
  const activeCampaign = getActiveCampaign();

  // Determine if the active speaker is a player character
  const isPlayerSpeaking = activeSpeakerId !== 'dm';

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // This is the corrected useEffect to prevent infinite loops.
  // It only resets the speaker if the currently selected character is removed from the campaign.
  useEffect(() => {
    // If the active speaker is a player character...
    if (activeSpeakerId !== 'dm') {
      // ...check if that character still exists in the list.
      const speakerExists = playerCharacters.some(pc => pc.id === activeSpeakerId);
      // If the character has been removed, reset the speaker to the default (Narrator).
      if (!speakerExists) {
        setActiveSpeakerId('dm');
      }
    }
  }, [playerCharacters, activeSpeakerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isThinking || !activeSessionId) return;

    let userMessageContent = inputMessage;
    let authorId = activeSpeakerId;
    let authorName = 'Narrador';

    if (isPlayerSpeaking) {
      const pc = playerCharacters.find(p => p.id === activeSpeakerId);
      if (pc) {
        authorName = pc.name;
      }
      // Roll the d5 and append to the message
      const rollResult = rollD5();
      userMessageContent = `${inputMessage} (Tirada de d5: ${rollResult})`;
      toast.info(`Has tirado un d5 y obtuviste un ${rollResult}.`);
    } else {
      // If the user speaks as DM, their ID is the active narrator's ID
      authorId = activeNarrator.id;
    }

    addMessage({
      role: 'user',
      content: userMessageContent,
      authorId,
      authorName,
    });

    setInputMessage('');
    setIsThinking(true);

    try {
      const apiMessages = messages.map(({ role, content }) => ({ role, content }));
      apiMessages.push({ role: 'user', content: userMessageContent });

      const adventurePremise = activeAdventure?.premise || '';
      
      const currentSceneState = sceneStates[activeSessionId] || {};
      const sceneCharacters = playerCharacters.map(pc => ({
        ...pc,
        control: currentSceneState[pc.id] || 'player',
      })).filter(pc => pc.control !== 'absent');

      // Prepare campaign context for the API
      const campaignContext = activeCampaign ? {
        worldDescription: activeCampaign.worldDescription,
        uniqueFeatures: activeCampaign.uniqueFeatures,
        worldTone: activeCampaign.worldTone,
        campaignNpcs: activeCampaign.campaignNpcs,
      } : undefined;

      const finalSystemPrompt = `CONTEXTO DE LA AVENTURA: ${adventurePremise}\n\nINSTRUCCIONES DEL NARRADOR: ${activeNarrator.systemPrompt}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProvider,
          messages: apiMessages,
          temperature: activeNarrator.temperature,
          maxLength: activeNarrator.maxLength,
          tone: activeNarrator.tone,
          systemPrompt: finalSystemPrompt,
          sceneCharacters: sceneCharacters,
          campaignContext: campaignContext, // Pass the new campaign context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener respuesta de la IA');
      }

      const data = await response.json();
      addMessage({
        role: 'assistant',
        content: data.message,
        authorId: activeNarrator.id,
        authorName: activeNarrator.name,
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      toast.error(`Error: ${error.message}`);
      addMessage({
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        authorId: activeNarrator.id,
        authorName: activeNarrator.name,
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setInputMessage('');
    setIsThinking(false);
    toast.info('Sesión reiniciada.');
  };

  const chatTitle = activeCampaign && activeAdventure && activeSession
    ? `${activeCampaign.name} / ${activeAdventure.name} / ${activeSession.name}`
    : 'Sesión de Rol';

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
        <h2 className="text-lg font-semibold truncate" title={chatTitle}>
          {chatTitle}
        </h2>
        <div className="flex items-center gap-2">
          <ManageScene>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Users className="h-5 w-5" />
              <span className="sr-only">Gestionar Escena</span>
            </Button>
          </ManageScene>
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" onClick={handleNewChat}>
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Reiniciar Sesión</span>
          </Button>
        </div>
      </header>
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4 pb-24"> {/* Added pb-24 */}
        {messages.map((msg) => {
          const isUserMessage = msg.role === 'user';
          const isNarratorMessage = msg.authorId.startsWith('narrator-') || msg.authorId.startsWith('dungeon-master') || msg.authorId.startsWith('sci-fi-ai') || msg.authorId.startsWith('cthulhu-keeper');

          let bubbleStyle = { bg: 'bg-secondary', text: 'text-secondary-foreground' }; // Default for AI Narrator

          if (isUserMessage) {
            if (isNarratorMessage) {
              bubbleStyle = { bg: 'bg-primary', text: 'text-primary-foreground' }; // User speaking as Narrator
            } else {
              bubbleStyle = getCharacterColor(msg.authorId); // User speaking as PC
            }
          }

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col p-3 rounded-lg max-w-[80%] sm:max-w-[70%]",
                bubbleStyle.bg,
                bubbleStyle.text,
                isUserMessage
                  ? 'self-end rounded-br-none'
                  : 'self-start rounded-bl-none'
              )}
            >
              <div className="font-bold mb-1">
                {msg.authorName}:
              </div>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
              <div className="text-xs opacity-70 mt-2 text-right">
                {format(msg.timestamp, 'HH:mm:ss', { locale: es })}
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="flex flex-col p-3 rounded-lg max-w-[80%] sm:max-w-[70%] bg-secondary text-secondary-foreground self-start rounded-bl-none animate-pulse">
            <div className="font-bold mb-1">{activeNarrator.name}:</div>
            <div>...pensando</div>
            <div className="text-xs opacity-70 mt-2 text-right">
              {format(new Date(), 'HH:mm:ss', { locale: es })}
            </div>
          </div>
        )}
      </main>
      <footer className="fixed bottom-0 w-full lg:w-[calc(100%-280px)] border-t border-border p-4 flex items-center gap-2 flex-shrink-0 bg-background"> {/* Added fixed positioning */}
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Select value={activeSpeakerId} onValueChange={setActiveSpeakerId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar personaje..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Narrador</span>
                </div>
              </SelectItem>
              {playerCharacters.map(pc => (
                <SelectItem key={pc.id} value={pc.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{pc.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Escribe la acción o diálogo..."
            className="flex-1 bg-input text-foreground border-input focus-visible:ring-ring"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isThinking}
          />
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isThinking || (isPlayerSpeaking && !inputMessage.trim())}
          >
            {isPlayerSpeaking ? (
              <>
                <Dice5 className="h-4 w-4" />
                <span className="ml-2">Tirar Dado y Enviar</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </>
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}