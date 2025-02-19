import { Server as ServerIO } from 'socket.io'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const io = new ServerIO({
  path: '/api/projects/tictactoe/socket',
  addTrailingSlash: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

let gameState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: "none"
}

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

export async function GET(req: NextRequest) {
  return new Response('Socket is running', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
