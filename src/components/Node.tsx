
import styles from '@/components/Node.module.css'

function Node(props: any) {
  const {
    isMousedDown,
    setStartPos,
    setTargetPos,
    setIsMousedDown,
    position,
    startPos,
    targetPos,
    nodeToMove,
    setNodeToMove,
    wall,
    setWall,
    visitedCell,
    path,
    visualizing
  } = props
  const [row, col] = position
  const i = row()
  const j = col()

  const onMouseDown = () => {
    if(!visualizing()) {
      if(isStartNode()) {
        setIsMousedDown(true)
        setNodeToMove('start_node')
      } else if(isTargetNode()) {
        setIsMousedDown(true)
        setNodeToMove('target_node')
      } else {
        setIsMousedDown(true)
        setNodeToMove('wall')
        buildWall()
      }
    }
  }

  const buildWall = () => {
    const newWall = { ...wall(), [`${i}_${j}`]: true }
    setWall(newWall)
  }

  const onMouseUp = () => {
    setIsMousedDown(false)
  }

  const onMouseEnter = () => {
    if(isMousedDown() && !visualizing()) {
      if(nodeToMove() === 'start_node' && !isTargetNode() && !isWall())
        setStartPos([i, j])
      else if(nodeToMove() === 'target_node' && !isStartNode() && !isWall())
        setTargetPos([i, j])
      else if(nodeToMove() === 'wall' && !isTargetNode() && !isStartNode()) {
        buildWall()
      }
    }
  }

  const isStartNode = () => {
    const [x, y] = startPos()
    return i === x && j === y
  }

  const isTargetNode = () => {
    const [x, y] = targetPos()
    return i === x && j === y
  }

  const isWall = () => {
    return wall()[`${i}_${j}`] === true
  }

  const isVisited = () => {
    return visitedCell()[`${i}_${j}`] === true
  }

  const isPath = () => {
    return path()[`${i}_${j}`] === true
  }
  
  return (
    <td class={styles.cell}>
      <div 
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        class={styles.node}
      >
        {isStartNode() ?
        <div class={styles.start}>
        </div> 
        : null
        }

        {isTargetNode() ?
        <div class={styles.target}>
        </div> 
        : null
        }

        {isWall() ?
        <div class={styles.wall}>
        </div> 
        : null
        }
 
        {isVisited() ?
        <div class={styles.visitedCell}>
        </div> 
        : null
        }

        {isPath() ?
        <div class={styles.path}>
        </div> 
        : null
        }
      </div>
    </td>
  );
}

export default Node;
