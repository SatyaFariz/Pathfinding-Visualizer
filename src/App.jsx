import logo from './logo.svg';
import styles from './App.module.css';
import { createSignal, For } from 'solid-js'
import Node from './components/Node'

const ROW = 33
const COL = 84

const ROW_MIDDLE = Math.ceil(ROW / 2)

function App() {
  const [startPos, setStartPos] = createSignal([ROW_MIDDLE, 10])
  const [nodeToMove, setNodeToMove] = createSignal()
  const [targetPos, setTargetPos] = createSignal([ROW_MIDDLE, COL - 11])
  const [isMousedDown, setIsMousedDown] = createSignal(false)
  const [grid, setGrid] = createSignal(new Array(ROW).fill(new Array(COL).fill(0)))
  const [wall, setWall] = createSignal({})
  return (
    <div class={styles.App}>
      <button onClick={() => setWall({})}>
        Reset
      </button>
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
