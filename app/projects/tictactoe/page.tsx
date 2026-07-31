"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GameState {
	board: (string | null)[];
	xIsNext: boolean;
	winner: string;
}

export default function TicTacToePage() {
	const [gameState, setGameState] = useState<GameState>({
		board: Array(9).fill(null),
		xIsNext: true,
		winner: "none",
	});
	const [roomId, setRoomId] = useState<string>("");
	const [inputRoomId, setInputRoomId] = useState<string>("");
	const [playerCount, setPlayerCount] = useState<number>(0);
	const [error, setError] = useState<string>("");
	const [gameStarted, setGameStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [playerRole, setPlayerRole] = useState<"X" | "O" | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		"disconnected" | "connecting" | "connected"
	>("disconnected");

	const wsRef = useRef<WebSocket | null>(null);

	const GAME_SERVER_URL =
		"wss://portfolio-game-server.rodrigoburdet.workers.dev";

	const connectToRoom = useCallback((id: string) => {
		if (wsRef.current) {
			wsRef.current.close();
		}

		setConnectionStatus("connecting");
		const ws = new WebSocket(`${GAME_SERVER_URL}/room/${id}`);
		wsRef.current = ws;

		ws.onopen = () => {
			setConnectionStatus("connected");
			setIsLoading(false);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case "init":
						setPlayerRole(data.role);
						setGameState(data.gameState);
						setPlayerCount(data.playerCount);
						break;
					case "gameState":
						setGameState(data.gameState);
						break;
					case "playerJoined":
						setPlayerCount(data.playerCount);
						break;
					case "playerLeft":
						setPlayerCount(data.playerCount);
						break;
					case "error":
						setError(data.message);
						setTimeout(() => setError(""), 3000);
						break;
				}
			} catch (e) {
				console.error("Failed to parse message:", e);
			}
		};

		ws.onclose = () => {
			setConnectionStatus("disconnected");
		};

		ws.onerror = (err) => {
			console.error("WebSocket error:", err);
			setError("Connection error");
			setConnectionStatus("disconnected");
			setIsLoading(false);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, []);

	const generateRoomId = () => {
		const words = [
			"apple",
			"banana",
			"cherry",
			"dragon",
			"eagle",
			"falcon",
			"grape",
			"honey",
			"igloo",
			"jungle",
			"koala",
			"lemon",
			"mango",
			"ninja",
			"ocean",
			"panda",
		];
		return (
			words[Math.floor(Math.random() * words.length)] +
			Math.floor(Math.random() * 1000)
		);
	};

	const handleCreateRoom = async () => {
		setIsLoading(true);
		const newRoomId = generateRoomId();
		setRoomId(newRoomId);
		setGameStarted(true);
		connectToRoom(newRoomId);
	};

	const handleJoinRoom = () => {
		if (!inputRoomId.trim()) return;
		setIsLoading(true);
		setRoomId(inputRoomId.trim());
		setGameStarted(true);
		connectToRoom(inputRoomId.trim());
	};

	const handleBack = () => {
		if (wsRef.current) {
			wsRef.current.close();
		}
		setGameStarted(false);
		setRoomId("");
		setInputRoomId("");
		setPlayerCount(0);
		setError("");
		setPlayerRole(null);
		setConnectionStatus("disconnected");
		setGameState({
			board: Array(9).fill(null),
			xIsNext: true,
			winner: "none",
		});
	};

	const handleClick = (index: number) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return;
		}
		if (gameState.board[index] || gameState.winner !== "none") {
			return;
		}
		if (playerCount < 2) {
			setError("Waiting for another player to join...");
			return;
		}

		wsRef.current.send(JSON.stringify({ type: "move", index }));
	};

	const handleRestart = () => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
		wsRef.current.send(JSON.stringify({ type: "reset" }));
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

	const isMyTurn = playerRole === (gameState.xIsNext ? "X" : "O");

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
								onClick={handleCreateRoom}
								className="w-full max-w-xs h-12 text-lg"
								disabled={isLoading}
							>
								{isLoading ? "Creating..." : "Create New Room"}
							</Button>
							<div className="w-full max-w-xs">
								<div className="text-sm font-medium mb-2">
									Or join an existing room:
								</div>
								<div className="flex flex-col gap-2">
									<input
										type="text"
										value={inputRoomId}
										onChange={(e) => setInputRoomId(e.target.value)}
										placeholder="Enter room ID"
										className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<Button
										onClick={handleJoinRoom}
										className="w-full h-10"
										disabled={!inputRoomId.trim() || isLoading}
									>
										{isLoading ? "Joining..." : "Join Room"}
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
							Leave Game
						</Button>
						<CardTitle className="font-mono">Game Room</CardTitle>
						<div className="text-sm text-muted-foreground">
							Room ID: <span className="font-mono font-bold">{roomId}</span> (
							{playerCount}/2 players)
						</div>
						<div className="flex items-center gap-2 text-sm mt-1">
							<span
								className={`w-2 h-2 rounded-full ${
									connectionStatus === "connected"
										? "bg-green-500"
										: connectionStatus === "connecting"
											? "bg-yellow-500"
											: "bg-red-500"
								}`}
							/>
							<span className="capitalize">{connectionStatus}</span>
						</div>
						{playerRole && (
							<div className="text-sm font-medium mt-1">
								You are: <span className="text-lg font-bold">{playerRole}</span>
								{playerCount >= 2 && (
									<span className="ml-2">
										({isMyTurn ? "Your turn" : "Opponent's turn"})
									</span>
								)}
							</div>
						)}
					</CardHeader>

					<CardContent>
						<div className="flex flex-col items-center gap-4">
							{playerCount < 2 && (
								<div className="text-center py-4 px-6 bg-muted rounded-lg mb-4">
									<p className="text-muted-foreground">
										Waiting for another player...
									</p>
									<p className="text-sm mt-2">
										Share this room ID:{" "}
										<span className="font-mono font-bold">{roomId}</span>
									</p>
								</div>
							)}

							<div className="grid grid-cols-3 gap-2">
								{Array(9)
									.fill(null)
									.map((_, i) => (
										<div key={i}>{renderSquare(i)}</div>
									))}
							</div>

							<div className="text-xl font-semibold mt-4">
								{gameState.winner === "draw"
									? "Game Draw!"
									: gameState.winner !== "none"
										? `Winner: ${gameState.winner}`
										: `Next Player: ${gameState.xIsNext ? "X" : "O"}`}
							</div>

							{error && (
								<div className="text-red-500 text-sm font-medium">{error}</div>
							)}

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
