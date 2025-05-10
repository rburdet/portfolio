export interface DemoLink {
  title: string;
  path: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  demoLinks?: DemoLink[];
}

export const projects: Project[] = [
  {
    id: "gym-routine",
    title: "My Gym Routine",
    description: "A personal workout tracker to manage exercises and track progress",
    technologies: ["React", "TypeScript", "CSS", "LocalStorage"],
    demoLinks: [
      {
        title: "Gym Routine Demo",
        path: "exercises"
      }
    ]
  },
  {
    id: "tictactoe",
    title: "Online Tic Tac Toe",
    description: "A multiplayer tic tac toe game with real-time updates",
    technologies: ["React", "WebSockets", "Node.js", "CSS"],
    demoLinks: [
      {
        title: "Play Tic Tac Toe",
        path: "tictactoe"
      }
    ]
  },
  {
    id: "constellation",
    title: "Constellation",
    description: "Interactive star visualization and constellation mapping tool",
    technologies: ["React", "Three.js", "WebGL", "CSS"],
    demoLinks: []
  },
  {
    id: "takehome-project",
    title: "Future Take Home Project",
    description: "A technical assessment project for a job application",
    technologies: ["To be determined"],
    demoLinks: []
  }
];

