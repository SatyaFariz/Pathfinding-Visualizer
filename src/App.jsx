import logo from './logo.svg';
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

    const getCellWalls = (i, j) => {
      return [
        [i, j + 1],
        [i, j - 1],
        [i + 1, j],
        [i - 1, j]
      ]
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

    while(current) {
      const next = getNextNeighborToVisit(...current)
      if(next) {
        visited[next.join('_')] = true
        const wall = getWallBetweenCells(current, next)
        delete _wall[`${wall[0]}_${wall[1]}`]
      }

      current = next
    }

    // console.log('neighbors', getUnvisitedCellNeighbors(4, 4))

    setWall(_wall)
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
      </div>
      
      <div class={styles.gridContainer}>
        <div>
          <For each={grid()}>
            {(row, i) => (
              <div class={styles.row}>
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
                      />
                    )
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default App;
