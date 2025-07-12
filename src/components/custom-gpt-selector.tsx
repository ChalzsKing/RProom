"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChat } from '@/context/chat-context';

export function CustomGptSelector() {
  const { activeGpt, setActiveGpt, customGpts } = useChat();

  return (
    <Select value={activeGpt.id} onValueChange={setActiveGpt}>
      <SelectTrigger className="w-[180px] bg-input text-foreground border-input focus:ring-ring">
        <SelectValue placeholder="Seleccionar GPT" />
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground border-border">
        {customGpts.map((gpt) => (
          <SelectItem key={gpt.id} value={gpt.id}>
            {gpt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}