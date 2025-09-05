export interface Comment {
  id: number;
  text: string;
  timestamp: Date;
  author: string;
}

export interface Question {
  id: number;
  text: string;
  timestamp: Date;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  comments: Comment[];
}
