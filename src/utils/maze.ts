/**
 * 迷宫生成算法
 */

export interface Cell {
  x: number
  y: number
  walls: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
  visited: boolean
}

export function generateMaze(width: number, height: number, seed?: number): Cell[][] {
  // 使用种子生成随机数
  let randomSeed = seed || Math.random()
  const random = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }

  const maze: Cell[][] = []
  
  // 初始化迷宫
  for (let y = 0; y < height; y++) {
    const row: Cell[] = []
    for (let x = 0; x < width; x++) {
      const cell: Cell = {
        x,
        y,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true
        },
        visited: false
      }
      row.push(cell)
    }
    maze.push(row)
  }

  // 使用深度优先搜索生成迷宫
  const stack: Cell[] = []
  const start = maze[0]?.[0]
  if (!start) return maze
  
  start.visited = true
  stack.push(start)

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    if (!current) break
    
    const neighbors = getUnvisitedNeighbors(current, maze, width, height)

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(random() * neighbors.length)]
      if (next) {
        removeWall(current, next)
        next.visited = true
        stack.push(next)
      }
    } else {
      stack.pop()
    }
  }

  // 确保入口和出口
  const startCell = maze[0]?.[0]
  if (startCell) {
    startCell.walls.left = false
  }
  const endCell = maze[height - 1]?.[width - 1]
  if (endCell) {
    endCell.walls.right = false
  }

  return maze
}

function getUnvisitedNeighbors(cell: Cell, maze: Cell[][], width: number, height: number): Cell[] {
  const neighbors: Cell[] = []
  const { x, y } = cell

  const top = y > 0 ? maze[y - 1]?.[x] : undefined
  const right = x < width - 1 ? maze[y]?.[x + 1] : undefined
  const bottom = y < height - 1 ? maze[y + 1]?.[x] : undefined
  const left = x > 0 ? maze[y]?.[x - 1] : undefined

  if (top && !top.visited) {
    neighbors.push(top)
  }
  if (right && !right.visited) {
    neighbors.push(right)
  }
  if (bottom && !bottom.visited) {
    neighbors.push(bottom)
  }
  if (left && !left.visited) {
    neighbors.push(left)
  }

  return neighbors
}

function removeWall(current: Cell, next: Cell) {
  if (current.x === next.x) {
    if (current.y > next.y) {
      current.walls.top = false
      next.walls.bottom = false
    } else {
      current.walls.bottom = false
      next.walls.top = false
    }
  } else {
    if (current.x > next.x) {
      current.walls.left = false
      next.walls.right = false
    } else {
      current.walls.right = false
      next.walls.left = false
    }
  }
}

export function getFragmentPositions(maze: Cell[][], count: number): Array<{ x: number; z: number }> {
  const positions: Array<{ x: number; z: number }> = []
  if (!maze[0]) return positions
  
  const width = maze[0].length
  const height = maze.length
  
  // 排除起点和终点
  const exclude = new Set([`0,0`, `${width - 1},${height - 1}`])
  
  for (let i = 0; i < count; i++) {
    let attempts = 0
    while (attempts < 100) {
      const x = Math.floor(Math.random() * width)
      const z = Math.floor(Math.random() * height)
      const key = `${x},${z}`
      
      if (!exclude.has(key)) {
        positions.push({ x: x * 2, z: z * 2 })
        exclude.add(key)
        break
      }
      attempts++
    }
  }
  
  return positions
}
