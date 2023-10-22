import {
  Grid,
  Dict,
  Point
} from '@/types'

type Cell = {
  key: string,
  position: Point,
  distance: number,
  visited: boolean,
  prevCell: Cell | null
}

type CellRef = { [key: string]: Cell }

const dijkstra = (grid: Grid, wall: Dict, startCell: Point, finishCell: Point) => {
  const visitedNodesInOrder = []
  const cellRef: CellRef = {}

  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[0].length; j++) {
      const prevCell = null
      const visited = false
      const position: Point = [i, j]
      const key = position.join('_')
      const distance = i === startCell[0] && j === startCell[1] ? 0 : Infinity
      const cell: Cell = {
        key,
        position,
        distance,
        visited,
        prevCell
      }
      cellRef[key] = cell
    }
  }

  const startCellKey = startCell.join('_')
  const priorityQueue = new PriorityQueue(cellRef)

  priorityQueue.insert(startCellKey)
  cellRef[startCellKey].visited = true
  
  while (priorityQueue.getSize()) {
    const closestCell = cellRef[priorityQueue.poll()]
    
    // If we encounter a wall, we skip it.
    if (wall[closestCell.key]) continue

    visitedNodesInOrder.push(closestCell)

    if (closestCell.position[0] === finishCell[0] && closestCell.position[1] === finishCell[1])
      return visitedNodesInOrder

    const neighbors = updateUnvisitedNeighbors(closestCell, cellRef, grid)
    
    for(const neighbor of neighbors) {
      priorityQueue.insert(neighbor.key)
    }
  }

  // If we don't find the finish cell inside the loop, we know it's trapped
  return visitedNodesInOrder
}

const getUnvisitedNeighbors = (cell: Cell, cellRef: CellRef, grid: Grid) => {
  const neighbors = []
  const [row, col] = cell.position

  if (row > 0) neighbors.push(cellRef[`${row - 1}_${col}`])
  if (row < grid.length - 1) neighbors.push(cellRef[`${row + 1}_${col}`])
  if (col > 0) neighbors.push(cellRef[`${row}_${col - 1}`])
  if (col < grid[0].length - 1) neighbors.push(cellRef[`${row}_${col + 1}`])
  return neighbors.filter(neighbor => !neighbor.visited)
}

const updateUnvisitedNeighbors = (cell: Cell, cellRef: CellRef, grid: Grid) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(cell, cellRef, grid)
  for(const neighbor of unvisitedNeighbors) {
    neighbor.distance = cell.distance + 1
    neighbor.prevCell = cell
    neighbor.visited = true
  }
  return unvisitedNeighbors
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the dijkstra method above.
const getNodesInShortestPathOrder = (finishCell: Cell | null) => {
  const nodesInShortestPathOrder = []
  let currentCell = finishCell
  while (currentCell !== null) {
    nodesInShortestPathOrder.unshift(currentCell)
    currentCell = currentCell.prevCell
  }
  return nodesInShortestPathOrder
}

// PriorityQueue class using MinHeap implementation
// Parent index: (index - 1) / 2
// Left child index: 2 * index + 1
// Right child index: 2 * index + 2
class PriorityQueue {
  cellRef: CellRef
  storage: string[]
  size: number
  constructor(cellRef: CellRef) {
    this.cellRef = cellRef
    this.storage = []
    this.size = 0
  }

  getSize() {
    return this.size
  }

  getParentIndex(index: number) {
    return Math.floor((index - 1) / 2)
  }

  getLeftChildIndex(index: number) {
    return 2 * index + 1
  }

  getRightChildIndex(index: number) {
    return 2 * index + 2
  }

  hasParent(index: number) {
    return this.getParentIndex(index) >= 0
  }

  hasLeftChild(index: number) {
    return this.getLeftChildIndex(index) < this.size
  }

  hasRightChild(index: number) {
    return this.getRightChildIndex(index) < this.size
  }

  parent(index: number) {
    return this.storage[this.getParentIndex(index)]
  }

  leftChild(index: number) {
    return this.storage[this.getLeftChildIndex(index)]
  }

  rightChild(index: number) {
    return this.storage[this.getRightChildIndex(index)]
  }

  swap(index1: number, index2: number) {
    const temp = this.storage[index1]
    this.storage[index1] = this.storage[index2]
    this.storage[index2] = temp
  }

  insert(key: string) {
    this.storage[this.size] = key
    this.size++
    this.heapifyUp()
  }

  heapifyUp() {
    let index = this.size - 1
    while(
      this.hasParent(index) && 
      this.cellRef[this.parent(index)].distance > this.cellRef[this.storage[index]].distance
    ) {
      this.swap(this.getParentIndex(index), index)
      index = this.getParentIndex(index)
    }
  }

  poll() {
    if(this.size === 0) throw new Error('Empty Heap')
    const key = this.storage[0]
    this.storage[0] = this.storage[this.size - 1]
    this.size--
    this.heapifyDown()
    return key
  }

  heapifyDown() {
    let index = 0
    while(this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index)
      if(
        this.hasRightChild(index) && 
        this.cellRef[this.rightChild(index)].distance < this.cellRef[this.leftChild(index)].distance
      ) {
        smallerChildIndex = this.getRightChildIndex(index)
      }
      if(
        this.cellRef[this.storage[index]].distance < this.cellRef[this.storage[smallerChildIndex]].distance
      ) {
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