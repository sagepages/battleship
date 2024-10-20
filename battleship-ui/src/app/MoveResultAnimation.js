import React, { useEffect, useState } from 'react';
import { AlertCircle, Target, Waves } from 'lucide-react';

const MoveResultAnimation = ({ result, cell, isOpponent }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const getAnimation = () => {
    switch (result) {
      case 'HIT':
        return (
          <div className="flex items-center text-red-500 animate-bounce">
            <Target className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold">Hit!</span>
          </div>
        );
      case 'SINK':
        return (
          <div className="flex items-center text-purple-500 animate-pulse">
            <AlertCircle className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold">Ship Sunk!</span>
          </div>
        );
      case 'MISS':
        return (
          <div className="flex items-center text-blue-500 animate-wiggle">
            <Waves className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold">Miss!</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 p-4 rounded-lg shadow-lg">
      {getAnimation()}
    </div>
  );
};

export default MoveResultAnimation;
