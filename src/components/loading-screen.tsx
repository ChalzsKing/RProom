"use client";

import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-foreground font-mono">Cargando Interfaz Matrix...</p>
      </div>
    </div>
  );
}