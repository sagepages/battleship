"use client"

import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [userGame, setUserGame] = useState(null);
  const [opponentGame, setOpponentGame] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  return (
    <GameContext.Provider value={{ userGame, setUserGame, opponentGame, setOpponentGame, isMyTurn, setIsMyTurn}}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameState = () => useContext(GameContext);
