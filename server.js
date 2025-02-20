import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let gameState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: "none"
}


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}


app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new SocketIOServer(httpServer);

    io.on('connection', (socket) => {
      console.log('Client connected')
      
      socket.emit('gameState', gameState)

      socket.on('makeMove', (index) => {
        
        if (gameState.board[index] || gameState.winner !== "none") return

        gameState.board[index] = gameState.xIsNext ? 'X' : 'O'
        gameState.xIsNext = !gameState.xIsNext

        const winner = calculateWinner(gameState.board)
        if (winner) {
          gameState.winner = winner
        } else if (!gameState.board.includes(null)) {
          gameState.winner = "draw"
        }
        console.log('Move made at index:', index)

        io.emit('gameState', gameState)
      })

      socket.on('restartGame', () => {
        gameState = {
          board: Array(9).fill(null),
          xIsNext: true,
          winner: "none"
        }
        io.emit('gameState', gameState)
        console.log('Restarting game:', gameState)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});


