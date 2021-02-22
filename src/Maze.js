import Sprite from './Sprite.js'
import Star from './Star.js'
import Door from './Door.js'

const MAP_URLS = [
  '../maps/map-3x3.js',
  '../maps/map-11x11.js',
  '../maps/map-100x100.js'
]
const MAP_URL = MAP_URLS[1]
const MAP_EMPTY = 0
const MAP_TILE = 1
const MAP_STAR = 2
const MAP_START = 3
const MAP_END = 4
const MAZE_BACKGROUND_COLOR = '#777777'

// The tile sprite sheet is a single row of square blocks
// sized 48x48px with different colours
const TILE_SPRITE_COLOURS = [
  'grey',
  'white',
  'black',
  'red',
  'brown',
  'yellow',
  'green',
  'cyan',
  'blue',
  'violet',
  'gold'
]
const TILE_SPRITE_SHEET_URL = '../assets/Tiles.png'
const TILE_SIZE = 48 // pixels

// Wood Floor tile from https://opengameart.org/content/wood-floor
const FLOOR_TILE_URL = '../assets/Wood Floor.png'
const FLOOR_TILE_SIZE = 32 // px square

const getTileSprite = (colour) => new Promise((resolve, reject) => {
  // Ensure the requested colour exists
  const hasColour = TILE_SPRITE_COLOURS.includes(colour)
  if (!hasColour) {
    reject('Invalid colour')
  }

  // Load the sprite sheet and create a sprite out of the selection
  const imgTiles = new Image()
  imgTiles.onload = function() {
    const index = TILE_SPRITE_COLOURS.indexOf(colour)
    const xOffset = index * TILE_SIZE
    resolve(new Sprite(imgTiles, xOffset, 0, TILE_SIZE, TILE_SIZE))
  }
  imgTiles.src = TILE_SPRITE_SHEET_URL
})

class Maze {
  constructor() {
    this.stars = []
    this.playerStart = undefined // to be an object with x and y keys
  }

  load() {
    return Promise.allSettled([
      getTileSprite('green'),
      import(MAP_URL).then(module => module.default),
      new Door().load(),
      Sprite.fromImage(FLOOR_TILE_URL, FLOOR_TILE_SIZE, FLOOR_TILE_SIZE, TILE_SIZE/FLOOR_TILE_SIZE)
    ])
      .then(([tileSprite, map, door, woodFloor])  => {
        this.map = map.value
        this.door = door.value
        this.tileSprite = tileSprite.value
        this.woodFloor = woodFloor.value
        this.createCanvas()
      })
  }

  createCanvas() {
    const canvas = document.createElement('canvas')
    canvas.height = this.map.length * TILE_SIZE
    canvas.width = this.map[0].length * TILE_SIZE
    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.fillStyle = MAZE_BACKGROUND_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw the tiles on the canvas using the tile map as a guide
    for (let y = 0 ; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const currPosition = { x: x * TILE_SIZE, y: y * TILE_SIZE }
        this.woodFloor.draw(ctx, currPosition.x, currPosition.y)
        switch (this.map[y][x]) {
          case MAP_EMPTY:
            // if the playerStart isn't set yet, assign it to the first empty cell
            if (this.playerStart === undefined) {
              this.playerStart = currPosition
            } else if (this.playerEnd === undefined) {
              // if the playerEnd isn't set yet, assign it to the last empty cell
              // that isn't occupied by the start
              this.playerEnd = currPosition
            }
            break;
          case MAP_TILE:
            this.tileSprite.draw(ctx, currPosition.x, currPosition.y)
            break;
          case MAP_STAR:
            this.stars.push(new Star(currPosition.x, currPosition.y))
            break;
          case MAP_START:
            this.playerStart = currPosition
            break;
          case MAP_END:
            this.playerEnd = currPosition
            break;
          default:
            break;
        }
      }
    }
    // draw the door at the end so that it doesn't get overlapped
    if (this.playerEnd !== undefined) {
      this.door.draw(ctx, this.playerEnd.x, this.playerEnd.y)
    }
    this.canvas = canvas
  }

  isEmpty(x, y) {
    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)
    const isInBounds = (
      tileX >= 0 &&
      tileY >= 0 &&
      this.map instanceof Array &&
      tileY < this.map.length &&
      tileX < this.map[tileY].length
    )
    return isInBounds && this.map[tileY][tileX] != MAP_TILE
  }

  update(tick, player) {
    // filter out any collided stars
    this.stars = this.stars.filter(star => !player.collidesWithStar(star))
  }

  drawMiniMap(ctx, player) {
    const { width, height } = ctx.canvas
    const padding = 20 // px
    const miniMapSize = 0.2 * height // 20% of screen height
    const left = width - padding - miniMapSize
    const top = padding
    ctx.fillStyle = '#00000080'
    ctx.fillRect(left, top, miniMapSize, miniMapSize)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(left, top, miniMapSize, miniMapSize)

    // draw star positions
    const starDotRadius = 3
    const fullCircle = Math.PI * 2 // radians
    ctx.fillStyle = 'yellow'
    this.stars.forEach(star => {
      const posX = (star.x / this.canvas.width) * miniMapSize
      const posY = (star.y / this.canvas.height) * miniMapSize
      ctx.beginPath()
      ctx.arc(left + posX, top + posY, starDotRadius, 0, fullCircle)
      ctx.fill()
    })

    // draw player position
    ctx.fillStyle = 'red'
    const playerPosX = (player.x / this.canvas.width) * miniMapSize
    const playerPosY = (player.y / this.canvas.height) * miniMapSize
    ctx.beginPath()
    ctx.arc(left + playerPosX, top + playerPosY, starDotRadius, 0, fullCircle)
    ctx.fill()
  }

  draw(ctx, tick, player, centerX, centerY) {
    if (!this.tileSprite) return

    // using the center position passed in and the context's canvas dimensions
    // calculate the top left corner and size to draw image
    const { width, height } = ctx.canvas
    const halfWidth = Math.floor(width / 2)
    const halfHeight = Math.floor(height / 2)
    const top = centerY - halfHeight
    const left = centerX - halfWidth
    ctx.drawImage(this.canvas,
      left, top, width, height, // source
      0, 0, width, height       // destination
    )

    // find any stars within viewport and draw them
    const visibleStars = this.stars.filter(star => (
      (star.x >= left && star.x <= left + width) &&
      (star.y >= top && star.y <= top + height)
    ))
    visibleStars.forEach(star => star.draw(ctx, tick, star.x - left, star.y - top))

    this.drawMiniMap(ctx, player)
  }
}

export default Maze