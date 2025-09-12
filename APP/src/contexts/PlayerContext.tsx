import React, { createContext, useContext } from 'react';
import { Player } from '../types/dnd';

export const PlayerContext = createContext<Player | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerContext.Provider');
  }
  return context;
};