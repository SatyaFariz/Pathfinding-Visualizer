import styles from './App.module.css';
import { createSignal, For } from 'solid-js'
import Node from './components/Node'

const ROW = 33
const COL = 85

const ROW_MIDDLE = Math.ceil(ROW / 2)

function App() {
  const [startPos, setStartPos] = createSignal([ROW_MIDDLE, 10])
  const [nodeToMove, setNodeToMove] = createSignal()
  const [targetPos, setTargetPos] = createSignal([ROW_MIDDLE, COL - 11])
  const [isMousedDown, setIsMousedDown] = createSignal(false)
  const [grid, setGrid] = createSignal(new Array(ROW).fill(new Array(COL).fill(0)))
  const [wall, setWall] = createSignal({})
  const [visitedCell, setVisitedCell] = createSignal({})
  const [path, setPath] = createSignal({})

  /*

  Recursive Backtracker

  The depth-first search algorithm of maze generation is frequently implemented using backtracking.

  - Make the initial cell the current cell and mark it as visited
  - While there are unvisited cells:
    - If the current cell has any neighbors which have not been visited:
      - Choose randomly one of the unvisited neighbors
      - Push the current cell to the stack
      - Remove the wall between the current cell and the chosen cell
      - Make the chosed cell the current cell and mark it as visited
    - Else if the stack is not empty:
      - Pop a cell from the stack
      - Make the current cell

  */

  const generateMaze = () => {
    const _wall = {}
    const _grid = grid()

    let current = [1, 1]
    const visited = { [current.join('_')]: true }
    const stack = []

    for(let i = 0; i < _grid.length; i = i + 2) {
      for(let j = 0; j < _grid[i].length; j = j + 1) {
        _wall[`${i}_${j}`] = true
      }
    }

    for(let i = 1; i < _grid.length; i = i + 2) {
      for(let j = 0; j < _grid[i].length; j = j + 2) {
        _wall[`${i}_${j}`] = true
      }
    }

    const getWallBetweenCells = (cell1, cell2) => {
      if(cell1[0] === cell2[0])
        return [cell1[0], (cell1[1] + cell2[1]) / 2]
      if(cell1[1] === cell2[1])
        return [(cell1[0] + cell2[0]) / 2, cell1[1]]
    }

    const getUnvisitedCellNeighbors = (i, j) => {
      const neighbors = []
      if(i >= 2 && !visited[`${i - 2}_${j}`]) {
        neighbors.push([i - 2, j])
      }
      if(i < _grid.length - 2 && !visited[`${i + 2}_${j}`]) {
        neighbors.push([i + 2, j])
      }
      if(j >= 2 && !visited[`${i}_${j - 2}`]) {
        neighbors.push([i, j - 2])
      }
      if(j < _grid[0].length - 2 && !visited[`${i}_${j + 2}`]) {
        neighbors.push([i, j + 2])
      }
      return neighbors
    }

    const shuffleArray = (array) => {
      if (array.length == 0) {
        return;
      }
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    
      return array[0]
    }

    const getNextNeighborToVisit = (i, j) => {
      const neighbors = getUnvisitedCellNeighbors(i, j)
      return shuffleArray(neighbors)
    }

    while(current || stack.length > 0) {
      
      let next = getNextNeighborToVisit(...current)
      if(!next) {
        next = stack.pop()
      } else {
        stack.push(next)
        visited[next.join('_')] = true
        const wall = getWallBetweenCells(current, next)
        delete _wall[`${wall[0]}_${wall[1]}`]
      }

      current = next
    }

    setWall(_wall)
    setStartPos([1, 1])
    setTargetPos([_grid.length - 2, _grid[0].length - 2])
  }

  const dijkstra = () => {
    const visitedNodesInOrder = []
    const startCell = startPos()
    const finishCell = targetPos()
    const _grid = grid()
    const _wall = wall()

    const unvisitedCells = []
    const cellRef = {}

    for(let i = 0; i < _grid.length; i++) {
      for(let j = 0; j < _grid[0].length; j++) {
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
      if (_wall[closestCell.position.join('_')]) continue

      // If the closest node is at a distance of infinity,
      // we must be trapped and should therefore stop.
      if (closestCell.distance === Infinity) return visitedNodesInOrder

      closestCell.visited = true
      visitedNodesInOrder.push(closestCell)

      if (closestCell.position[0] === finishCell[0] && closestCell.position[1] === finishCell[1])
        return visitedNodesInOrder

      updateUnvisitedNeighbors(closestCell, cellRef, _grid)
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

  const visualize = () => {
    const visitedCellsInOrder = dijkstra()
    const shortestPath = getNodesInShortestPathOrder(visitedCellsInOrder[visitedCellsInOrder.length - 1])
    
    for(let i = 0; i < visitedCellsInOrder.length; i++) {
      setTimeout(() => {
        if(i === visitedCellsInOrder.length - 1) {
          for(let i = 0; i < shortestPath.length; i++) {
            setTimeout(() => {
              setPath(prev => ({ ...prev, [shortestPath[i].position.join('_')]: true }))
            }, 10 * i)
          }
        }
        setVisitedCell(prev => ({ ...prev, [visitedCellsInOrder[i].position.join('_')]: true }))
      }, 10 * i)
    }
  }
  
  return (
    <div class={styles.App}>
      <div>
        <button onClick={() => setWall({})}>
          Reset
        </button>

        <button onClick={generateMaze}>
          Maze
        </button>

        <button onClick={visualize}>
          Visualize
        </button>
      </div>
      
      <div class={styles.gridContainer}>
        <div>
          <table className={styles.table}>
            <tbody>
            <For each={grid()}>
              {(row, i) => (
                <tr class={styles.row}>
                  <For each={row}>
                    {(item, j) => {
                      return(
                        <Node
                          position={[i, j]}
                          startPos={startPos}
                          targetPos={targetPos}
                          isMousedDown={isMousedDown}
                          setIsMousedDown={setIsMousedDown}
                          setStartPos={setStartPos}
                          setTargetPos={setTargetPos}
                          nodeToMove={nodeToMove}
                          setNodeToMove={setNodeToMove}
                          wall={wall}
                          setWall={setWall}
                          visitedCell={visitedCell}
                          path={path}
                        />
                      )
                    }}
                  </For>
                </tr>
              )}
            </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
