import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { useRouter } from "next/navigation";
import { useWebSocket } from "../socketContext";

export default function FindGame() {
  const [isLoading, setIsLoading] = useState(false);

  const socket = useWebSocket();
  const router = useRouter();

  function handleFindGame() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);

      socket.send(JSON.stringify({ Type: "searching" }));

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "setupGame":
            console.log("Found a match, initializing game...");
            router.push("/game");
            break;
          default:
            console.log("Unknown event type:", data.type);
        }
      };
    } else {
      console.error("WebSocket connection is not open.");
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center space-y-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold">
            Find Game
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Welcome! Ready to play?
          </p>
          <button
            onClick={handleFindGame}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md text-lg transition duration-300"
          >
            Find Game
          </button>
        </div>
      )}
    </div>
  );
}
