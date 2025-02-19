import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export type Socket = {
  server: NetServer
}

export const config = {
  api: {
    bodyParser: false,
  },
}

let gameState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: "none"
}

export function initSocket(res: NextApiResponseServerIO) {
  if ((res.socket.server as any).io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/projects/tictactoe/socket',
      addTrailingSlash: false,
    })
    
    io.on('connection', (socket) => {
      console.log('Client connected')
      
      socket.emit('gameState', gameState)

      socket.on('makeMove', (index: number) => {
        console.log('Move made at index:', index)
        
        if (gameState.board[index] || gameState.winner !== "none") return

        gameState.board[index] = gameState.xIsNext ? 'X' : 'O'
        gameState.xIsNext = !gameState.xIsNext

        const winner = calculateWinner(gameState.board)
        if (winner) {
          gameState.winner = winner
        } else if (!gameState.board.includes(null)) {
          gameState.winner = "draw"
        }

        io.emit('gameState', gameState)
      })

      socket.on('resetGame', () => {
        gameState = {
          board: Array(9).fill(null),
          xIsNext: true,
          winner: "none"
        }
        io.emit('gameState', gameState)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })

    ;(res.socket.server as any).io = io
  }
}

function calculateWinner(squares: Array<string | null>): string | null {
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

