import React from 'react';
import { Trophy, Frown } from 'lucide-react';
import { useRouter } from "next/navigation";


const GameOver = ({ isWinner }) => {
  const router = useRouter()
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        {isWinner ? (
          <div className="text-yellow-500 animate-bounce">
            <Trophy size={64} className="mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Congratulations!</h2>
            <p className="text-2xl">You've won the battle!</p>
          </div>
        ) : (
          <div className="text-blue-500 animate-pulse">
            <Frown size={64} className="mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Game Over</h2>
            <p className="text-2xl">Better luck next time, captain!</p>
          </div>
        )}
        <button 
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => router.push("/")}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
