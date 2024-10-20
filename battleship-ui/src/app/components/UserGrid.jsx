import React from 'react';

const shipEmoji = {
  1: '🚢',
  2: '🚤',
  3: '🛥️',
  4: '⛴️',
  5: '🛳️', // Changed from black flag to another ship emoji
};
const hitEmoji = '💥';
const missEmoji = '⚪'; // Changed to a white circle

export const UserGrid = ({ userGrid }) => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="grid grid-cols-11 gap-1">
      <div className="h-8 w-8" />
      {columns.map((col) => (
        <div key={col} className="h-8 w-8 flex items-center justify-center font-bold text-blue-600">
          {col}
        </div>
      ))}
      {userGrid.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <div className="h-8 w-8 flex items-center justify-center font-bold text-blue-600">
            {rowIndex + 1}
          </div>
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md bg-blue-100 transition duration-200"
            >
              {cell === 0 ? (
                <span className="text-lg"></span> // Empty cell
              ) : cell >= 1 && cell <= 5 ? (
                <span className="text-lg">{shipEmoji[cell]}</span>
              ) : cell === 9 ? (
                <span className="text-lg">{hitEmoji}</span>
              ) : cell === 8 ? (
                <span className="text-lg">{missEmoji}</span>
              ) : null}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};
