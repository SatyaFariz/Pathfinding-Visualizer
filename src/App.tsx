import styles from '@/App.module.css';
import { createSignal, createEffect, For } from 'solid-js'
import Node from '@/components/Node'
import mazeGenerator from '@/algorithms/mazeGenerator'
import dijkstra, { getNodesInShortestPathOrder } from '@/algorithms/dijkstra'
import aStar from '@/algorithms/aStar'
import {
  Dict,
  Grid,
  Point
} from '@/types'

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

const algoTypes = ['dijkstra', 'a_star']

function App() {
  const [startPos, setStartPos] = createSignal<Point>([ROW_MIDDLE, 10])
  const [nodeToMove, setNodeToMove] = createSignal<string>()
  const [targetPos, setTargetPos] = createSignal<Point>([ROW_MIDDLE, COL - 11])
  const [isMousedDown, setIsMousedDown] = createSignal(false)
  const [grid] = createSignal<Grid>(new Array(ROW).fill(new Array(COL).fill(0)))
  const [wall, setWall] = createSignal<Dict>({})
  const [visitedCell, setVisitedCell] = createSignal<Dict>({})
  const [path, setPath] = createSignal<Dict>({})
  const [visualizing, setVisualizing] = createSignal(false)

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

    const visited: Dict = {}
    for(const cell of visitedCellsInOrder) {
      visited[cell.position.join('_')] = true
    }

    setVisitedCell(visited)

    if(!isTrapped) {
      const newPath: Dict = {}
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

  const visualizeAStar = () => {
    setPath({})
    setVisitedCell({})
    setVisualizing(true)
    const { visitedNodesInOrder, path } = aStar(grid(), wall(), startPos(), targetPos())
    const isTrapped = path.length === 0
    
    for(let i = 0; i < visitedNodesInOrder.length; i++) {
      setTimeout(() => {
        if(i === visitedNodesInOrder.length - 1) {
          if(!isTrapped) {
            for(let i = 0; i < path.length; i++) {
              setTimeout(() => {
                setPath(prev => ({ ...prev, [path[i].node.join('_')]: true }))
                if(i === path.length - 1) {
                  setVisualizing(false)
                }
              }, 10 * i)
            }
          } else {
            setVisualizing(false)
          }
        }
        setVisitedCell(prev => ({ ...prev, [visitedNodesInOrder[i].node.join('_')]: true }))
      }, 10 * i)
    }
  }

  const revisualizeAStar = () => {
    const { visitedNodesInOrder, path } = aStar(grid(), wall(), startPos(), targetPos())
    const isTrapped = path.length === 0

    const visited: Dict = {}
    for(const cell of visitedNodesInOrder) {
      visited[cell.node.join('_')] = true
    }

    setVisitedCell(visited)

    if(!isTrapped) {
      const newPath: Dict = {}
      for(const cell of path) {
        newPath[cell.node.join('_')] = true
      }

      setPath(newPath)
    } else {
      setPath({})
    }
  }

  const algoTypes = {
    "0": {
      label: `Dijkstra's Algorithm`,
      visualize: visualize,
      revisualize: revisualize
    },
    "1": {
      label: `A* Algorithm`,
      visualize: visualizeAStar,
      revisualize: revisualizeAStar
    }
  }

  const [algo, setAlgo] = createSignal('0')

  createEffect((prev: any) => {
    const currentStartPos = startPos()
    const currentTargetPos = targetPos()
    const currentWall = wall()
    if(Object.keys(visitedCell()).length > 0 && !visualizing()) {
      if(
        currentStartPos.join('_') !== prev.startPos.join('_') ||
        currentTargetPos.join('_') !== prev.targetPos.join('_') ||
        JSON.stringify(currentWall) !== JSON.stringify(prev.wall)
      ) {
        (algoTypes as any)[algo()].revisualize()
      }
    }
    return {
      startPos: currentStartPos,
      targetPos: currentTargetPos,
      wall: currentWall
    }
  })

  const clearBoard = () => {
    setVisitedCell({})
    setPath({})
    setWall({})
  }

  const clearWalls = () => {
    if(!visualizing()) setWall({})
  }
  
  return (
    <div class={styles.app}>
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
          You can create walls by clicking on any nodes.
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
            onClick={() => (algoTypes as any)[algo()].visualize()}
            disabled={visualizing()}
          >
            Visualize
          </button>

          <select 
            class={styles.select}
            value={algo()}
            onChange={(e) => setAlgo(e.currentTarget.value)}
          >
            {Object.keys(algoTypes).map(item =>
              <option value={item}>{((algoTypes as any)[item]).label}</option>
            )}
          </select>
        </div>
      </div>
      
      <div class={styles.gridContainer}>
        <div class={styles.tableContainer}>
          <table class={styles.table}>
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
