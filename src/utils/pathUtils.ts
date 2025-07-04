
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  id: number;
  points: Point[];
  length: number;
  isCorrect: boolean;
  color: string;
  name: string;
}

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

export const calculatePathLength = (points: Point[]): number => {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += calculateDistance(points[i], points[i + 1]);
  }
  return totalLength;
};

export const generateRandomPath = (start: Point, end: Point, complexity: number, offset: number): Point[] => {
  const points = [start];
  
  for (let i = 0; i < complexity; i++) {
    const t = (i + 1) / (complexity + 1);
    const baseX = start.x + (end.x - start.x) * t;
    const baseY = start.y + (end.y - start.y) * t;
    
    // Add controlled randomness with offset to avoid overlapping
    const offsetX = (Math.random() - 0.5) * 80 + offset;
    const offsetY = (Math.random() - 0.5) * 60 + (offset * 0.5);
    
    points.push({
      x: Math.max(80, Math.min(320, baseX + offsetX)),
      y: Math.max(80, Math.min(220, baseY + offsetY))
    });
  }
  
  points.push(end);
  return points;
};

export const generatePathQuestion = (): Path[] => {
  const start: Point = { x: 50, y: 150 };
  const end: Point = { x: 350, y: 150 };
  
  const paths: Path[] = [];
  const pathConfigs = [
    { color: '#EF4444', name: 'Red Path', offset: -40 },
    { color: '#3B82F6', name: 'Blue Path', offset: -20 },
    { color: '#10B981', name: 'Green Path', offset: 0 },
    { color: '#F59E0B', name: 'Yellow Path', offset: 20 },
    { color: '#8B5CF6', name: 'Purple Path', offset: 40 }
  ];
  
  // Generate 5 distinct paths
  for (let i = 0; i < 5; i++) {
    const complexity = Math.floor(Math.random() * 2) + 2; // 2-3 waypoints
    const points = generateRandomPath(start, end, complexity, pathConfigs[i].offset);
    const length = calculatePathLength(points);
    
    paths.push({
      id: i,
      points,
      length,
      isCorrect: false,
      color: pathConfigs[i].color,
      name: pathConfigs[i].name
    });
  }
  
  // Mark the shortest path as correct
  const shortestPath = paths.reduce((prev, current) => 
    current.length < prev.length ? current : prev
  );
  shortestPath.isCorrect = true;
  
  return paths;
};

export const generateSVGPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return path;
};
