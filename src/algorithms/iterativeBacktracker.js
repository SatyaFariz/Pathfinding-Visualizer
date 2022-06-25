/*

Iterative Backtracker

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

const iterativeBacktracker = (grid) => {
  const wall = {}

  let current = [1, 1]
  const visited = { [current.join('_')]: true }
  const stack = []

  initializeWalls(grid, wall)

  while(current || stack.length > 0) {
    
    let next = getNextNeighborToVisit(...current, grid, visited)
    if(!next) {
      next = stack.pop()
    } else {
      stack.push(next)
      visited[next.join('_')] = true
      const wallInBetween = getWallBetweenCells(current, next)
      delete wall[`${wallInBetween[0]}_${wallInBetween[1]}`]
    }

    current = next
  }

  return wall
}

const getUnvisitedCellNeighbors = (i, j, grid, visited) => {
  const neighbors = []
  if(i >= 2 && !visited[`${i - 2}_${j}`]) {
    neighbors.push([i - 2, j])
  }
  if(i < grid.length - 2 && !visited[`${i + 2}_${j}`]) {
    neighbors.push([i + 2, j])
  }
  if(j >= 2 && !visited[`${i}_${j - 2}`]) {
    neighbors.push([i, j - 2])
  }
  if(j < grid[0].length - 2 && !visited[`${i}_${j + 2}`]) {
    neighbors.push([i, j + 2])
  }
  return neighbors
}

const getNextNeighborToVisit = (i, j, grid, visited) => {
  const neighbors = getUnvisitedCellNeighbors(i, j, grid, visited)
  return shuffleArray(neighbors)
}

const getWallBetweenCells = (cell1, cell2) => {
  if(cell1[0] === cell2[0])
    return [cell1[0], (cell1[1] + cell2[1]) / 2]
  if(cell1[1] === cell2[1])
    return [(cell1[0] + cell2[0]) / 2, cell1[1]]
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

const initializeWalls = (grid, wall) => {
  for(let i = 0; i < grid.length; i = i + 2) {
    for(let j = 0; j < grid[i].length; j = j + 1) {
      wall[`${i}_${j}`] = true
    }
  }

  for(let i = 1; i < grid.length; i = i + 2) {
    for(let j = 0; j < grid[i].length; j = j + 2) {
      wall[`${i}_${j}`] = true
    }
  }
}

export default iterativeBacktracker