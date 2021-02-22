// A Node.js app to convert output of the maze genearotor into a map of digits representing walls for this application

// inputData is a 2D array of objects containing keys: x, y, walls
// where walls is an array of strings (e.g. ["north","east","west"])
const inputData = require('./input-maze-3x3.json')

// NOTE: the scale is doubled, meaning that 1 space in the maze
// takes up 2x2 space in the end.
// Walls will be build using 2x1 and corners will be filled in on adjacent sides
/*
convert: {"x":0,"y":0,"walls":["north","east","west"]}
into this:
[
  [1, 1, 1, 1]
  [1, 0, 0, 1]
  [1, 0, 0 ,1]
  [0, 0, 0, 0]
]

Next, the squares will need to be stitched together.
When two sides touch, each outer line is removed

example input, two cells, one above another:
[
  [
    [1, 1, 1, 1]
    [1, 0, 0, 1]
    [1, 0, 0 ,1]
    [1, 0, 0, 1]
  ],
  [
    [1, 0, 0, 0]
    [1, 0, 0, 0]
    [1, 0, 0 ,0]
    [1, 1, 1, 1]
  ]
]

would return:

[
  [1, 1, 1, 1]
  [1, 0, 0, 1]
  [1, 0, 0 ,1]
  [1, 0, 0, 0]
  [1, 0, 0 ,0]
  [1, 1, 1, 1]
]
*/

// convert maze-cell to map-grid
/*
convert: {"x":0,"y":0,"walls":["north","east","west"]}
into this:
[
  [1, 1, 1, 1]
  [1, 0, 0, 1]
  [1, 0, 0 ,1]
  [1, 0, 0, 1]
]
// paint the center with zeros, then apply walls
*/
const WEST_WALL = 'west'
const EAST_WALL = 'east'
const NORTH_WALL = 'north'
const SOUTH_WALL = 'south'

function cellWallsToGrid(walls) {
  const GRID_SIZE = 4 // 4 values per row or column
  // create a 2D array (4x4) of zeros
  const mapGrid = new Array(GRID_SIZE).fill()
    .map(() => new Array(GRID_SIZE).fill(0))
  // apply walls
  if (walls.includes(WEST_WALL)) {
    for (let i = 0; i < GRID_SIZE; i++) {
      mapGrid[i][0] = 1
    }
  }
  if (walls.includes(EAST_WALL)) {
    for (let i = 0; i < GRID_SIZE; i++) {
      mapGrid[i][GRID_SIZE - 1] = 1
    }
  }
  if (walls.includes(NORTH_WALL)) {
    for (let i = 0; i < GRID_SIZE; i++) {
      mapGrid[0][i] = 1
    }
  }
  if (walls.includes(SOUTH_WALL)) {
    for (let i = 0; i < GRID_SIZE; i++) {
      mapGrid[GRID_SIZE - 1][i] = 1
    }
  }
  return mapGrid
}

const drawCellGrid = (grid) => {
  for (let y = 0; y < grid.length; y++) {
    let rowStr = ''
    for (let x = 0; x < grid[y].length; x++) {
      rowStr += (grid[y][x] > 0 ? 'X' : '.')
    }
    console.log(rowStr)
  }
}

// transpose inputData[x][y] to output[y][x]
function transposeCellsToGrid(cells) {
  const output = new Array(cells[0].length).fill()
    .map(() => new Array(cells.length).fill())

  cells.forEach((col) => {
    col.forEach((cell) => {
      output[cell.y][cell.x] = cellWallsToGrid(cell.walls)
    })
  })

  return output
}

function mergeCellGrids(cellGrids) {
  const rowsPerGridCell = 4
  const colsPerGridCell = 4
  const numOutputRows = (cellGrids.length * rowsPerGridCell) - (cellGrids.length - 1)
  const numOutputCols = (cellGrids[0].length * colsPerGridCell) - (cellGrids[0].length - 1)
  const output = new Array(numOutputRows).fill()
    .map(() => new Array(numOutputCols).fill(0))

  for (let y = 0; y < cellGrids.length; y++) {
    for (let x = 0; x < cellGrids[y].length; x++) {
      const grid = cellGrids[y][x]
      const yOffset = y * 3
      for (let gridY = (y === 0 ? 0 : 1); gridY < grid.length; gridY++) {
        if (x === 0) {
          output[gridY + yOffset] = [...grid[gridY]]
        } else {
          output[gridY + yOffset] = [...output[gridY + yOffset], ...grid[gridY].slice(1)]
        }
      }
    }
  }
  return output
}

///////////////////////////

function convert(input, outputFilename) {
  const cellGrids = transposeCellsToGrid(input)
  const result = mergeCellGrids(cellGrids)
  const formattedRows = result.map(row => `  [${row.toString()}]`)
  const resultStr = '[\n' + formattedRows.join(',\n') + '\n]'
  require('fs').writeFileSync(outputFilename, resultStr)
}

const map3x3 = require('./input-maze-3x3.json')
convert(map3x3, 'map-3x3.json')

const map11x11 = require('./input-maze-11x11.json')
convert(map11x11, 'map-11x11.json')

const map100x100 = require('./input-maze-100x100.json')
convert(map100x100, 'map-100x100.json')
