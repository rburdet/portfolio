import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { faker } from '@faker-js/faker';

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Map of boardIds -> games
const gameRooms = new Map();

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new SocketIOServer(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("createBoard", () => {
      // Generate a short noun (4-6 letters)
      const boardId = faker.word.noun({ length: { min: 5, max: 7 } });

      // Create new game room
      gameRooms.set(boardId, {
        gameState: {
          board: Array(9).fill(null),
          xIsNext: true,
          winner: "none",
        },
        players: {
          X: socket.id  // First player is always X
        }
      });

      socket.join(boardId);
      socket.emit("boardCreated", { boardId, role: 'X' });
    });

    socket.on("joinBoard", (boardId) => {
      const room = gameRooms.get(boardId);

      if (!room) {
        socket.emit("error", "Board not found");
        return;
      }

      if (room.players.X && room.players.O) {
        socket.emit("error", "Board is full");
        return;
      }

      // Assign role O to second player
      if (!room.players.O) {
        room.players.O = socket.id;
        socket.join(boardId);
        gameRooms.set(boardId, room);

        // Emit current game state and role to the joining player
        socket.emit("gameState", room.gameState);
        socket.emit("roleAssigned", 'O');

        // Notify all players that the game can start
        io.to(boardId).emit("playerJoined", 2);
      }
    });

    socket.on("makeMove", ({ boardId, index }) => {
      const room = gameRooms.get(boardId);
      if (!room) return;

      const { gameState } = room;

      // Check if it's the player's turn and they're making a valid move
      const currentPlayer = gameState.xIsNext ? 'X' : 'O';
      if (
        (room.players[currentPlayer] !== socket.id) || // Not this player's turn
        gameState.board[index] || // Square already filled
        gameState.winner !== "none" // Game already won
      ) {
        socket.emit("error", "Not your turn or invalid move");
        return;
      }

      gameState.board[index] = currentPlayer;
      gameState.xIsNext = !gameState.xIsNext;

      const winner = calculateWinner(gameState.board);
      if (winner) {
        gameState.winner = winner;
      } else if (!gameState.board.includes(null)) {
        gameState.winner = "draw";
      }

      room.gameState = gameState;
      gameRooms.set(boardId, room);

      io.to(boardId).emit("gameState", gameState);
    });

    socket.on("resetGame", (boardId) => {
      const room = gameRooms.get(boardId);
      if (!room) return;

      room.gameState = {
        board: Array(9).fill(null),
        xIsNext: true,
        winner: "none",
      };

      gameRooms.set(boardId, room);
      io.to(boardId).emit("gameState", room.gameState);
    });

    socket.on("disconnect", () => {
      // Remove player from any game rooms they were in
      gameRooms.forEach((room, boardId) => {
        const playerIndex = room.players.indexOf(socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            gameRooms.delete(boardId);
          } else {
            gameRooms.set(boardId, room);
            io.to(boardId).emit("playerLeft", room.players.length);
          }
        }
      });

      console.log("Client disconnected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
