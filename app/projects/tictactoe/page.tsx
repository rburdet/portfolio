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

interface GameState {
  board: string[];
  xIsNext: boolean;
  winner: string;
}

export default function TicTacToePage() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: "none",
  });
  const [boardId, setBoardId] = useState<string>("");
  const [inputBoardId, setInputBoardId] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerRole, setPlayerRole] = useState<"X" | "O" | null>(null);
 

  const gameStateUpdate = (data: GameState) => {
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
    socket.on("boardCreated", ({ boardId, role }: { boardId: string, role: "X" | "O" }) => {
      setBoardId(boardId);
      setPlayerRole(role);
      setGameStarted(true);
      setPlayerCount(1);
    });
    
    socket.on("roleAssigned", (role: "X" | "O") => {
      setPlayerRole(role);
    });
    socket.on("playerJoined", (count: number) => {
      setPlayerCount(count);
    });
    socket.on("playerLeft", (count: number) => {
      setPlayerCount(count);
    });
    socket.on("error", (msg: string) => {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameState", gameStateUpdate);
      socket.off("boardCreated");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("error");
    };
  }, []);

  const handleCreateBoard = () => {
    if (!socket) return;
    setIsLoading(true);
    socket.emit("createBoard");
  };

  const handleJoinBoard = () => {
    if (!socket || !inputBoardId.trim()) return;
    setIsLoading(true);
    socket.emit("joinBoard", inputBoardId.trim());
    setBoardId(inputBoardId.trim());
    setGameStarted(true);
    setIsLoading(false);
  };

  const handleBack = () => {
    setGameStarted(false);
    setBoardId("");
    setInputBoardId("");
    setPlayerCount(0);
    setError("");
    setGameState({
      board: Array(9).fill(null),
      xIsNext: true,
      winner: "none",
    });
  };

  const handleClick = (index: number) => {
    if (!socket || !socket.connected || !boardId) {
      console.log("Socket not connected or no board ID");
      return;
    }
    if (gameState.board[index] || gameState.winner !== "none") {
      console.log("Invalid move");
      return;
    }
    if (playerCount < 2) {
      setError("Waiting for another player to join...");
      return;
    }
    console.log("Making move at index:", index);
    socket.emit("makeMove", { boardId, index });
  };

  const handleRestart = () => {
    if (!socket || !boardId) return;
    socket.emit("resetGame", boardId);
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

      {!gameStarted ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Join or Create a Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 py-4">
              <Button
                onClick={handleCreateBoard}
                className="w-full max-w-xs h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create New Board"}
              </Button>
              <div className="w-full max-w-xs">
                <div className="text-sm font-medium mb-2">
                  Or join an existing board:
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={inputBoardId}
                    onChange={(e) => setInputBoardId(e.target.value)}
                    placeholder="Enter board ID"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleJoinBoard}
                    className="w-full h-10"
                    disabled={!inputBoardId.trim() || isLoading}
                  >
                    {isLoading ? "Joining..." : "Join Board"}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="absolute right-4 top-4"
            >
              New Game
            </Button>
            <CardTitle className="font-mono">Game Board</CardTitle>
            <div className="text-sm text-muted-foreground">
              Board ID: {boardId} ({playerCount}/2 players)
            </div>
            <div className="text-sm font-medium mt-1">
              You are playing as: {playerRole}
              {gameState.xIsNext ? 
                ` (${playerRole === 'X' ? "Your turn" : "Opponent's turn"})` : 
                ` (${playerRole === 'O' ? "Your turn" : "Opponent's turn"})`
              }
            </div>
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
      )}
    </div>
  );
}
