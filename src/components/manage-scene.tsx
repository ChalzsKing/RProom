"use client";

import React from 'react';
import { useChat, SceneControl } from '@/context/chat-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from './ui/separator';

interface ManageSceneProps {
  children: React.ReactNode;
}

export function ManageScene({ children }: ManageSceneProps) {
  const { activeSessionId, playerCharacters, sceneStates, updateSceneState } = useChat();

  if (!activeSessionId) {
    return null;
  }

  const currentSceneState = sceneStates[activeSessionId] || {};

  const handleControlChange = (characterId: string, control: SceneControl) => {
    if (activeSessionId) {
      updateSceneState(activeSessionId, characterId, control);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background text-foreground border-l border-border flex flex-col">
        <SheetHeader>
          <SheetTitle>Gestor de Escena</SheetTitle>
          <SheetDescription>
            Define qué personajes están presentes en la escena y quién los controla. La IA actuará en nombre de los personajes que le asignes.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 py-4">
          {playerCharacters.length > 0 ? (
            playerCharacters.map((pc) => (
              <div key={pc.id}>
                <div className="mb-4">
                  <h4 className="font-semibold">{pc.name}</h4>
                  <p className="text-sm text-muted-foreground">{pc.description}</p>
                </div>
                <RadioGroup
                  defaultValue={currentSceneState[pc.id] || 'player'}
                  onValueChange={(value) => handleControlChange(pc.id, value as SceneControl)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="player" id={`player-${pc.id}`} className="peer sr-only" />
                    <Label htmlFor={`player-${pc.id}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Jugador
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="ai" id={`ai-${pc.id}`} className="peer sr-only" />
                    <Label htmlFor={`ai-${pc.id}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      IA
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="absent" id={`absent-${pc.id}`} className="peer sr-only" />
                    <Label htmlFor={`absent-${pc.id}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Ausente
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay personajes en esta campaña. Añádelos desde el panel de la izquierda.</p>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}