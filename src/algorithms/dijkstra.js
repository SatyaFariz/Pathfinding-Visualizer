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

// Parent index: (index - 1) / 2
// Left child index: 2 * index + 1
// Right child index: 2 * index + 2
class MinHeap {
  constructor() {
    this.storage = []
    this.size = 0
  }

  getParentIndex(index) {
    return Math.floor((index - 1) / 2)
  }

  getLeftChildIndex(index) {
    return 2 * index + 1
  }

  getRightChildIndex(index) {
    return 2 * index + 2
  }

  hasParent(index) {
    return this.getParentIndex(index) >= 0
  }

  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.size
  }

  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.size
  }

  parent(index) {
    return this.storage[this.getParentIndex(index)]
  }

  leftChild(index) {
    return this.storage[this.getLeftChildIndex(index)]
  }

  rightChild(index) {
    return this.storage[this.getRightChildIndex(index)]
  }

  swap(index1, index2) {
    const temp = this.storage[index1]
    this.storage[index1] = this.storage[index2]
    this.storage[index2] = temp
  }

  insert(data) {
    this.storage[this.size] = data
    this.size++
    this.heapifyUp()
  }

  heapifyUp() {
    let index = this.size - 1
    while(this.hasParent(index) && this.parent(index) > this.storage[index]) {
      this.swap(this.getParentIndex(index), index)
      index = this.getParentIndex(index)
    }
  }

  poll() {
    if(this.size === 0) throw new Error('Empty Heap')
    const data = this.storage[0]
    this.storage[0] = this.storage[this.size - 1]
    this.size--
    this.heapifyDown()
    return data
  }

  heapifyDown() {
    let index = 0
    while(this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index)
      if(this.hasRightChild(index) && this.rightChild(index) < this.leftChild(index)) {
        smallerChildIndex = this.getRightChildIndex(index)
      }
      if(this.storage[index] < this.storage[smallerChildIndex]) {
        break
      } else {
        this.swap(index, smallerChildIndex)
      }
      index = smallerChildIndex
    }
  }
}

export default dijkstra
export { getNodesInShortestPathOrder }