import React from 'react';
import { Crosshair } from 'lucide-react';

const PlayingTurn = () => {
  return (
    <div className="flex items-center justify-center">
      <Crosshair className="w-8 h-8 text-red-500 mr-2 animate-bounce" />
      <div className="text-2xl font-bold text-red-600">
        Your turn! Take your shot!
      </div>
    </div>
  );
};

export default PlayingTurn;
