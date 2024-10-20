import React, { useState, useEffect } from 'react';

const WaitingTurn = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '' : prevDots + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="text-2xl font-bold text-blue-600 animate-pulse">
        Waiting for opponent's move{dots}
      </div>
    </div>
  );
};

export default WaitingTurn;
