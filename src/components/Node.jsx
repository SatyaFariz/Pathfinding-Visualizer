
import { createSignal, For } from 'solid-js'
import styles from './Node.module.css'

function Node(props) {
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
    setWall
  } = props
  const [row, col] = position
  const i = row()
  const j = col()

  const onMouseDown = () => {
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

  const buildWall = () => {
    const newWall = { ...wall(), [`${i}_${j}`]: true }
    setWall(newWall)
  }

  const onMouseUp = () => {
    setIsMousedDown(false)
  }

  const onMouseEnter = () => {
    if(isMousedDown()) {
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

  const getClass = () => {
    if(i === 0 && j === 0) {
      return isWall() ? styles.topLeftBorderNodeWall : styles.topLeftBorderNode
    } else if(i === 0) {
      return isWall() ? styles.topBorderNodeWall : styles.topBorderNode
    } else if(j === 0) {
      return isWall() ? styles.leftBorderNodeWall : styles.leftBorderNode
    } else {
      return isWall() ? styles.NodeWall : styles.Node
    }
  }
  
  return (
    <div 
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      class={getClass()}
    >
      {isStartNode() ?
      <div class={styles.startNode}>
      </div> 
      : null
      }

      {isTargetNode() ?
      <div class={styles.targetNode}>
      </div> 
      : null
      }

      {isWall() ?
      <div class={styles.wall}>
      </div> 
      : null
      }
    </div>
  );
}

export default Node;
