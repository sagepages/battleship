import React from 'react';

// components/LoadingScreen.jsx
const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
      <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
      <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
    </div>
  );
};

export default LoadingScreen;
