import React from 'react';

const hitEmoji = '💥';
const missEmoji = '⚪'; // Changed to a white circle

export const OpponentGrid = ({ opponentGrid, onCellClick, isMyTurn }) => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="grid grid-cols-11 gap-1">
      <div className="h-8 w-8" />
      {columns.map((col) => (
        <div key={col} className="h-8 w-8 flex items-center justify-center font-bold text-red-600">
          {col}
        </div>
      ))}
      {opponentGrid.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <div className="h-8 w-8 flex items-center justify-center font-bold text-red-600">
            {rowIndex + 1}
          </div>
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md ${
                cell === 'o' && isMyTurn ? 'bg-red-100 hover:bg-red-200 cursor-pointer' : 'bg-white'
              } transition duration-200`}
              onClick={() => isMyTurn && cell === 'o' && onCellClick([rowIndex,cellIndex])}
            >
              {cell === 'x' ? (
                <span className="text-lg">{hitEmoji}</span>
              ) : cell === 'm' ? (
                <span className="text-lg">{missEmoji}</span>
              ) : (
                <span className="text-lg"></span> // Empty cell
              )}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};
