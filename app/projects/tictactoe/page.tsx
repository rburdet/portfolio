"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { socket } from "./socket";

function onConnect() {
  console.log("connected ");
}

function onDisconnect() {
  console.log("disconnected ");
}

export default function TicTacToePage() {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: "none",
  });

  const gameStateUpdate = (data) => {
    console.log("state update ", data);
    setGameState(data);
  };

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameState", gameStateUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleClick = (index: number) => {
    if (!socket || !socket.connected) {
      console.log("Socket not connected");
      return;
    }
    if (gameState.board[index] || gameState.winner !== "none") {
      console.log("Invalid move");
      return;
    }
    console.log("Making move at index:", index);
    socket.emit("makeMove", index);
  };

  const handleRestart = () => {
    if (!socket) return;
    socket.emit("restartGame");
  };

  const renderSquare = (index: number) => (
    <Button
      variant="outline"
      className="w-20 h-20 text-2xl"
      onClick={() => handleClick(index)}
      disabled={!!gameState.board[index] || gameState.winner !== "none"}
    >
      {gameState.board[index]}
    </Button>
  );

  return (
    <div className="container px-4 py-16 md:py-24">
      <Link
        href="/projects"
        className="text-muted-foreground hover:text-foreground mb-8 inline-block"
      >
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">
        Tic Tac Toe
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Game Board</CardTitle>
        </CardHeader>
        <div className="text-xl font-semibold mt-4">
          {gameState.winner === "draw"
            ? "Game Draw!"
            : gameState.winner !== "none"
              ? `Winner: ${gameState.winner}`
              : `Next Player: ${gameState.xIsNext ? "X" : "O"}`}
        </div>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-3 gap-2">
              {Array(9)
                .fill(null)
                .map((_, i) => (
                  <div key={i}>{renderSquare(i)}</div>
                ))}
            </div>
            <div className="text-xl font-semibold mt-4">
              {gameState.winner !== "none"
                ? `Winner: ${gameState.winner}`
                : `Next Player: ${gameState.xIsNext ? "X" : "O"}`}
            </div>
            <Button onClick={handleRestart} className="mt-4">
              Restart Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
