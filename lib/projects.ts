export interface DemoLink {
  title: string;
  path: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  codeSnippet: string;
  demoLinks?: DemoLink[];
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Binary Search Tree Visualizer",
    description:
      "Interactive visualization of BST operations with step-by-step animations",
    longDescription:
      "This project provides an interactive visualization of Binary Search Tree (BST) operations. Users can insert, delete, and search for nodes in the BST, with step-by-step animations showing how each operation affects the tree structure. This tool is designed to help students and developers better understand the mechanics of BSTs.",
    technologies: ["TypeScript", "React", "Canvas API"],
    codeSnippet: `
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    this.root = this._insertRecursive(this.root, value);
  }

  _insertRecursive(node, value) {
    if (node === null) {
      return new TreeNode(value);
    }

    if (value < node.value) {
      node.left = this._insertRecursive(node.left, value);
    } else if (value > node.value) {
      node.right = this._insertRecursive(node.right, value);
    }

    return node;
  }

  // Other methods (delete, search) would be implemented here
}
`,
  },
  {
    id: "2",
    title: "Path Finding Algorithm",
    description: "Visual implementation of A* and Dijkstra's algorithms",
    longDescription:
      "This project showcases a visual implementation of two popular pathfinding algorithms: A* and Dijkstra's. Users can create obstacles on a grid, select start and end points, and watch as the algorithms find the shortest path. The visualization helps in understanding how these algorithms work and how they differ in various scenarios.",
    technologies: ["JavaScript", "React", "Tailwind CSS"],
    codeSnippet: `
function aStar(start, goal, h) {
  const openSet = new PriorityQueue();
  openSet.enqueue(start, 0);
  
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start, 0);
  
  const fScore = new Map();
  fScore.set(start, h(start));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    for (const neighbor of getNeighbors(current)) {
      const tentativeGScore = gScore.get(current) + d(current, neighbor);
      
      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, gScore.get(neighbor) + h(neighbor));
        
        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore.get(neighbor));
        }
      }
    }
  }

  return null; // No path found
}
`,
  },
  {
    id: "3",
    title: "Autocomplete Component",
    description: "A reusable autocomplete component with TypeScript and React",
    longDescription:
      "This project demonstrates the implementation of a performant autocomplete component built with React and TypeScript. It features debounced input handling, keyboard navigation, and customizable suggestion rendering. The component is designed to be reusable and accessible, following modern web development best practices.",
    technologies: ["TypeScript", "React", "Tailwind CSS", "Accessibility"],
    demoLinks: [
      {
        title: "Interactive Autocomplete Demo",
        path: "autocomplete",
      },
    ],
    codeSnippet: `
const Autocomplete = ({ 
  items, 
  onSelect, 
  renderItem 
}: AutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  
  const debouncedSearch = useDebounce((value: string) => {
    const filtered = items.filter(item => 
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  }, 300);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border rounded shadow">
          {suggestions.map((item, index) => (
            <li key={index} onClick={() => onSelect(item)}>
              {renderItem ? renderItem(item) : item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`,
  },
  {
    id: "4",
    title: "Real-time Tic Tac Toe",
    description:
      "Multiplayer Tic Tac Toe game with real-time updates using Socket.IO",
    longDescription:
      "A real-time multiplayer Tic Tac Toe game implemented using Socket.IO and Next.js. Players can join the game and make moves that are instantly synchronized across all connected clients. The game features real-time state management, move validation, win detection, and game reset functionality.",
    technologies: [
      "TypeScript",
      "Next.js",
      "Socket.IO",
      "React",
      "Tailwind CSS",
    ],
    demoLinks: [
      {
        title: "Play Tic Tac Toe",
        path: "tictactoe",
      },
    ],
    codeSnippet: `
// Socket.IO game state management
io.on('connection', (socket) => {
  // Send current game state to new players
  socket.emit('gameState', gameState)

  socket.on('makeMove', (index: number) => {
    if (gameState.board[index] || gameState.winner !== "none") return

    // Update game state
    gameState.board[index] = gameState.xIsNext ? 'X' : 'O'
    gameState.xIsNext = !gameState.xIsNext

    // Check for winner
    const winner = calculateWinner(gameState.board)
    if (winner) {
      gameState.winner = winner
    } else if (!gameState.board.includes(null)) {
      gameState.winner = "draw"
    }

    // Broadcast updated state to all clients
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
})`,
  },
];
