import styles from './App.module.css';
import { createSignal, createEffect, For } from 'solid-js'
import Node from './components/Node'
import mazeGenerator from './algorithms/mazeGenerator'
import dijkstra, { getNodesInShortestPathOrder } from './algorithms/dijkstra'

const ROW = 27
const COL = 85

const ROW_MIDDLE = Math.ceil(ROW / 2)

const legends = [
  {
    label: 'Start Node',
    className: 'startNode'
  },
  {
    label: 'Target Node',
    className: 'targetNode'
  },
  {
    label: 'Visited Node',
    className: 'visitedNode'
  },
  {
    label: 'Shortest Path Node',
    className: 'pathNode'
  },
  {
    label: 'Wall Node',
    className: 'wallNode'
  }
]

function App() {
  const [startPos, setStartPos] = createSignal([ROW_MIDDLE, 10])
  const [nodeToMove, setNodeToMove] = createSignal()
  const [targetPos, setTargetPos] = createSignal([ROW_MIDDLE, COL - 11])
  const [isMousedDown, setIsMousedDown] = createSignal(false)
  const [grid] = createSignal(new Array(ROW).fill(new Array(COL).fill(0)))
  const [wall, setWall] = createSignal({})
  const [visitedCell, setVisitedCell] = createSignal({})
  const [path, setPath] = createSignal({})
  const [visualizing, setVisualizing] = createSignal(false)

  createEffect((prev) => {
    const currentStartPos = startPos()
    const currentTargetPos = targetPos()
    const currentWall = wall()
    if(Object.keys(visitedCell()).length > 0 && !visualizing()) {
      if(
        currentStartPos.join('_') !== prev.startPos.join('_') ||
        currentTargetPos.join('_') !== prev.targetPos.join('_') ||
        JSON.stringify(currentWall) !== JSON.stringify(prev.wall)
      ) {
        revisualize()
      }
    }
    return {
      startPos: currentStartPos,
      targetPos: currentTargetPos,
      wall: currentWall
    }
  })

  const generateMaze = () => {
    setPath({})
    setVisitedCell({})
    const _grid = grid()
    const _wall = mazeGenerator(_grid)
    
    setWall(_wall)
    setStartPos([1, 1])
    setTargetPos([_grid.length - 2, _grid[0].length - 2])
  }

  const revisualize = () => {
    const visitedCellsInOrder = dijkstra(grid(), wall(), startPos(), targetPos())
    const finishCell = visitedCellsInOrder[visitedCellsInOrder.length - 1]
    const isTrapped = finishCell.position.join('_') !== targetPos().join('_')
    const shortestPath = getNodesInShortestPathOrder(finishCell)

    const visited = {}
    for(const cell of visitedCellsInOrder) {
      visited[cell.position.join('_')] = true
    }

    setVisitedCell(visited)

    if(!isTrapped) {
      const newPath = {}
      for(const cell of shortestPath) {
        newPath[cell.position.join('_')] = true
      }

      setPath(newPath)
    } else {
      setPath({})
    }
  }

  const visualize = () => {
    setPath({})
    setVisitedCell({})
    setVisualizing(true)
    const visitedCellsInOrder = dijkstra(grid(), wall(), startPos(), targetPos())
    const finishCell = visitedCellsInOrder[visitedCellsInOrder.length - 1]
    const isTrapped = finishCell.position.join('_') !== targetPos().join('_')
    const shortestPath = getNodesInShortestPathOrder(finishCell)
    
    for(let i = 0; i < visitedCellsInOrder.length; i++) {
      setTimeout(() => {
        if(i === visitedCellsInOrder.length - 1) {
          if(!isTrapped) {
            for(let i = 0; i < shortestPath.length; i++) {
              setTimeout(() => {
                setPath(prev => ({ ...prev, [shortestPath[i].position.join('_')]: true }))
                if(i === shortestPath.length - 1) {
                  setVisualizing(false)
                }
              }, 10 * i)
            }
          } else {
            setVisualizing(false)
          }
        }
        setVisitedCell(prev => ({ ...prev, [visitedCellsInOrder[i].position.join('_')]: true }))
      }, 10 * i)
    }
  }

  const clearBoard = () => {
    setVisitedCell({})
    setPath({})
    setWall({})
  }

  const clearWalls = () => {
    if(!visualizing()) setWall({})
  }
  
  return (
    <div class={styles.App}>
      <div class={styles.textTitleContainer}>
        <h1 class={styles.textTitle}>Pathfinding Visualizer</h1>
      </div>

      <div class={styles.legendsContainer}>
        <div class={styles.legends}>
          <For each={legends}>
            {(item) => {
              return (
                <div class={styles.legendItem}>
                  <div class={styles[item.className]}/>
                  <span class={styles.legendText}>{item.label}</span>
                </div>
              )
            }}
          </For>
        </div>
      </div>

      <div class={styles.textContainer}>
        <p class={styles.text}>
          You can create walls by clicking on any nodes. Dijkstra's Algorithm <b>guarantees</b> the shortest path.
        </p>
      </div>

      <div class={styles.buttonsContainer}>
        <div class={styles.buttonsGrid}>
          <button 
            class={styles.button}
            onClick={clearBoard}
            disabled={visualizing()}
          >
            Clear Board
          </button>

          <button 
            class={styles.button}
            onClick={clearWalls}
            disabled={visualizing()}
          >
            Clear Walls
          </button>

          <button 
            class={styles.button}
            onClick={generateMaze}
            disabled={visualizing()}
          >
            Maze
          </button>

          <button 
            class={styles.button}
            onClick={visualize}
            disabled={visualizing()}
          >
            Visualize
          </button>
        </div>
      </div>
      
      <div class={styles.gridContainer}>
        <div>
          <table className={styles.table}>
            <tbody>
            <For each={grid()}>
              {(row, i) => (
                <tr class={styles.row}>
                  <For each={row}>
                    {(_, j) => {
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
                          visualizing={visualizing}
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
