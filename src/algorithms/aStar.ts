/*
  OPEN //the set of nodes to be evaluated
  CLOSED //the set of nodes already evaluated

  add the start node to OPEN

  loop
    current = node in OPEN with the lowest f_cost
    remove current from OPEN
    add current to CLOSED

    if current is the target node //path has been found
      return

    foreach neighbour of the current node
      if neighbour is not traversable OR neighbour is in CLOSED
        skip to the next neighbour

      if new path to neighbor is shorter OR neighbour is not in OPEN
        set f_cost of neighbor
        set parent of neighbor to current

        if neighbour is not in OPEN
          add neighbour to OPEN
*/

import {
  Grid,
  Dict,
  Point
} from '@/types'

type Cell = {
  key: string,
  prevCell: Cell | null,
  node: Point,
  visited: boolean,
  g: number,
  h: number,
  f: number
}

type CellRef = { [key: string]: Cell }

const keyOfNode = (node: Point) => `${node[0]}_${node[1]}`

const aStar = (grid: Grid, wall: Dict, startNode: Point, finishNode: Point): { visitedNodesInOrder: Cell[], path: Cell[] } => {
  const visitedNodesInOrder: Cell[] = []
  const cellRef: CellRef = {}
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[0].length; j++) {
      const prevCell = null
      const node: Point = [i, j]
      const key = keyOfNode(node)
      const cell: Cell = {
        key,
        node,
        prevCell,
        visited: false,
        g: 0,
        h: 0,
        f: 0
      }
      cellRef[key] = cell
    }
  }
  let open: Point[] = []
  const closed: { [key: string]: true } = {}

  open.push(startNode)
  visitedNodesInOrder.push(cellRef[keyOfNode(startNode)])
  cellRef[keyOfNode(startNode)].visited = true

  while(open.length > 0) {
    const current = open[0]
    if(!cellRef[keyOfNode(current)].visited)
      visitedNodesInOrder.push(cellRef[keyOfNode(current)])

    open = open.filter(item => keyOfNode(item) !== keyOfNode(current))
    closed[keyOfNode(current)] = true

    // If we encounter a wall, we skip it.
    if (wall[keyOfNode(current)]) continue

    if(keyOfNode(current) === keyOfNode(finishNode))
      return { visitedNodesInOrder, path: reconstructPath(cellRef[keyOfNode(current)]) }

    const neighbors = getNeighbours(current, grid)
  
    for(const neighbour of neighbors) {
      if(closed[keyOfNode(neighbour)]) continue

      // Calculate tentative g value for the neighbor
      const tentativeG = cellRef[keyOfNode(current)].g + 1;  // Assuming each step has a cost of 1

      const neighborInOpen = open.findIndex(item => keyOfNode(item) === keyOfNode(neighbour)) !== -1
      if(tentativeG < cellRef[keyOfNode(neighbour)].g || !neighborInOpen) {
        cellRef[keyOfNode(neighbour)].g = tentativeG
        cellRef[keyOfNode(neighbour)].h = heuristic(cellRef[keyOfNode(neighbour)].node, finishNode);
        cellRef[keyOfNode(neighbour)].f = cellRef[keyOfNode(neighbour)].g + cellRef[keyOfNode(neighbour)].h;
        cellRef[keyOfNode(neighbour)].prevCell = cellRef[keyOfNode(current)];

        // Add the neighbor to the open set if not already present
        if (!neighborInOpen) {
          open.push(neighbour);
        }
      }
    }
  }

  return { visitedNodesInOrder, path: [] }
}

const heuristic = (node: Point, goal: Point) => {
  const [nodeRow, nodeCol] = node
  const [goalRow, goalCol] = goal
  // Simple Manhattan distance as the heuristic
  return Math.abs(nodeRow - goalRow) + Math.abs(nodeCol - goalCol);
}

const getNeighbours = (node: Point, grid: Grid) => {
  const neighbors: Point[] = []
  const [row, col] = node

  if (row > 0) neighbors.push([row - 1, col])
  if (row < grid.length - 1) neighbors.push([row + 1, col])
  if (col > 0) neighbors.push([row, col - 1])
  if (col < grid[0].length - 1) neighbors.push([row, col + 1])
  return neighbors
}

const reconstructPath = (cell: Cell | null) => {
  let path: Cell[] = [];
  while (cell !== null) {
      path.push(cell);
      cell = cell.prevCell;
  }
  return path.reverse();
}

export default aStar