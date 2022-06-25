const dijkstra = (grid, wall, startCell, finishCell) => {
  const visitedNodesInOrder = []

  const unvisitedCells = []
  const cellRef = {}

  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[0].length; j++) {
      const prevCell = null
      const visited = false
      const position = [i, j]
      const distance = i === startCell[0] && j === startCell[1] ? 0 : Infinity
      const cell = {
        position,
        distance,
        visited,
        prevCell
      }
      unvisitedCells.push(cell)
      cellRef[position.join('_')] = cell
    }
  }

  while (unvisitedCells.length) {
    unvisitedCells.sort((a, b) => a.distance - b.distance)
    const closestCell = unvisitedCells.shift()
    
    // If we encounter a wall, we skip it.
    if (wall[closestCell.position.join('_')]) continue

    // If the closest node is at a distance of infinity,
    // we must be trapped and should therefore stop.
    if (closestCell.distance === Infinity) return visitedNodesInOrder

    closestCell.visited = true
    visitedNodesInOrder.push(closestCell)

    if (closestCell.position[0] === finishCell[0] && closestCell.position[1] === finishCell[1])
      return visitedNodesInOrder

    updateUnvisitedNeighbors(closestCell, cellRef, grid)
  }
}

const getUnvisitedNeighbors = (cell, cellRef, grid) => {
  const neighbors = []
  const [row, col] = cell.position

  if (row > 0) neighbors.push(cellRef[`${row - 1}_${col}`])
  if (row < grid.length - 1) neighbors.push(cellRef[`${row + 1}_${col}`])
  if (col > 0) neighbors.push(cellRef[`${row}_${col - 1}`])
  if (col < grid[0].length - 1) neighbors.push(cellRef[`${row}_${col + 1}`])
  return neighbors.filter(neighbor => !neighbor.visited)
}

const updateUnvisitedNeighbors = (cell, cellRef, grid) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(cell, cellRef, grid)
  for(const neighbor of unvisitedNeighbors) {
    neighbor.distance = cell.distance + 1
    neighbor.prevCell = cell
  }
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the dijkstra method above.
const getNodesInShortestPathOrder = (finishCell) => {
  const nodesInShortestPathOrder = []
  let currentCell = finishCell
  while (currentCell !== null) {
    nodesInShortestPathOrder.unshift(currentCell)
    currentCell = currentCell.prevCell
  }
  return nodesInShortestPathOrder
}

export default dijkstra
export { getNodesInShortestPathOrder }