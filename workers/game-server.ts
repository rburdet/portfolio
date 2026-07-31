interface GameState {
  board: (string | null)[];
  xIsNext: boolean;
  winner: string;
}

interface PlayerInfo {
  role: 'X' | 'O';
}

export class GameRoom {
  private state: DurableObjectState;
  private players: Map<WebSocket, PlayerInfo> = new Map();
  private gameState: GameState = {
    board: Array(9).fill(null),
    xIsNext: true,
    winner: 'none',
  };

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    const role: 'X' | 'O' = this.players.size === 0 ? 'X' : 'O';
    this.players.set(server, { role });

    server.send(JSON.stringify({
      type: 'init',
      role,
      gameState: this.gameState,
      playerCount: this.players.size,
    }));

    this.broadcast({
      type: 'playerJoined',
      playerCount: this.players.size,
    }, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);
      const player = this.players.get(ws);
      
      if (!player) return;

      switch (data.type) {
        case 'move':
          this.handleMove(ws, player, data.index);
          break;
        case 'reset':
          this.handleReset();
          break;
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.players.delete(ws);
    this.broadcast({
      type: 'playerLeft',
      playerCount: this.players.size,
    });
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);
    this.players.delete(ws);
  }

  private handleMove(ws: WebSocket, player: PlayerInfo, index: number) {
    const currentPlayer = this.gameState.xIsNext ? 'X' : 'O';
    
    if (
      player.role !== currentPlayer ||
      this.gameState.board[index] ||
      this.gameState.winner !== 'none' ||
      this.players.size < 2
    ) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
      return;
    }

    this.gameState.board[index] = currentPlayer;
    this.gameState.xIsNext = !this.gameState.xIsNext;

    const winner = this.calculateWinner(this.gameState.board);
    if (winner) {
      this.gameState.winner = winner;
    } else if (!this.gameState.board.includes(null)) {
      this.gameState.winner = 'draw';
    }

    this.broadcast({ type: 'gameState', gameState: this.gameState });
  }

  private handleReset() {
    this.gameState = {
      board: Array(9).fill(null),
      xIsNext: true,
      winner: 'none',
    };
    this.broadcast({ type: 'gameState', gameState: this.gameState });
  }

  private broadcast(message: object, exclude?: WebSocket) {
    const data = JSON.stringify(message);
    for (const [ws] of this.players) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  private calculateWinner(squares: (string | null)[]): string | null {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }
}

interface Env {
  GAME_ROOMS: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/create') {
      const words = [
        'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'grape', 'honey',
        'igloo', 'jungle', 'koala', 'lemon', 'mango', 'ninja', 'ocean', 'panda',
      ];
      const roomId = words[Math.floor(Math.random() * words.length)] + Math.floor(Math.random() * 1000);
      return new Response(JSON.stringify({ roomId }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const match = path.match(/^\/room\/([^/]+)$/);
    if (match) {
      const roomId = match[1];
      const id = env.GAME_ROOMS.idFromName(roomId);
      const stub = env.GAME_ROOMS.get(id);
      return stub.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};

