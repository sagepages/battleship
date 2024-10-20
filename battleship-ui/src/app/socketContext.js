"use client"

import { createContext, useContext } from "react";
import { useEffect, useState } from "react";

export const WebSocketContext = createContext(null)

export const useWebSocket = () => {
  return useContext(WebSocketContext)
}

function waitForSocketConnection(socket, callback) {
  setTimeout(function () {
    if (socket.readyState === 1) {
      if (callback != null) {
        callback();
      }
    } else {
      waitForSocketConnection(socket, callback);
    }
  }, 5); // wait 5 milisecond for the connection...
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.hostname}:8080/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      waitForSocketConnection(ws, function() {
      console.log("WebSocket connection established");
      })
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws) {
        console.log("Closing WebSocket connection");
        ws.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
