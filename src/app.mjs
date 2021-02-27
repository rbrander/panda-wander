// app.js

// add breadcrumbs on demand (drop and not drop); bonus: add the ability to pick up
// fix the collision detection with the walls to be less aggressive
// add a timer (for consequence or for points to beat as a score)

// TODO: add input handler class
// TODO: add end-state (collected all stars)
// TODO: add a challenge (time limit, or enemy)
// TODO: create level editor
// TODO: add animations (juice)
// TODO: add door interation (animation and trigger)
// TODO: add support for going to next level

import Player from './Player.mjs'
import Maze from './Maze.mjs'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { alpha: true })
const BACKGROUND_COLOR = '#000'// '#505050'
let maze
let player
const hits = {}

const KEYS = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  W: 87,
  A: 65,
  S: 83,
  D: 68
}
const KEYS_DOWN = new Set()

function update(tick) {
  player.isMoving = (
    KEYS_DOWN.has(KEYS.DOWN) || KEYS_DOWN.has(KEYS.UP) ||
    KEYS_DOWN.has(KEYS.LEFT) || KEYS_DOWN.has(KEYS.RIGHT) ||
    KEYS_DOWN.has(KEYS.W) || KEYS_DOWN.has(KEYS.A) ||
    KEYS_DOWN.has(KEYS.S) || KEYS_DOWN.has(KEYS.D)
  )
  if (player.isMoving) {
    const prevPlayerX = player.x
    const prevPlayerY = player.y
    if (KEYS_DOWN.has(KEYS.DOWN) || KEYS_DOWN.has(KEYS.S)) {
      player.move('down')
    }
    if (KEYS_DOWN.has(KEYS.UP) || KEYS_DOWN.has(KEYS.W)) {
      player.move('up')
    }
    if (KEYS_DOWN.has(KEYS.LEFT) || KEYS_DOWN.has(KEYS.A)) {
      player.move('left')
    }
    if (KEYS_DOWN.has(KEYS.RIGHT) || KEYS_DOWN.has(KEYS.D)) {
      player.move('right')
    }
    // check the four corners of the panda to ensure we're not hitting anything
    const hasHitTopLeft = !maze.isEmpty(player.x, player.y)
    const hasHitTopRight = !maze.isEmpty(player.x + player.width -1, player.y)
    const hasHitBottomLeft = !maze.isEmpty(player.x, player.y + player.height-1)
    const hasHitBottomRight = !maze.isEmpty(player.x + player.width-1, player.y + player.height-1)
    const hasHitWall = hasHitTopLeft || hasHitTopRight || hasHitBottomLeft || hasHitBottomRight
    hits.topLeft = hasHitTopLeft
    hits.topRight = hasHitTopRight
    hits.bottomLeft = hasHitBottomLeft
    hits.bottomRight = hasHitBottomRight
    if (hasHitWall) {
      /*
      const hasHitBottom = (hasHitBottomLeft && hasHitBottomRight)
      // NOTE: this worked! do this for the other sides
      if (hasHitBottom) {
        // reduce the player's y position until it is empty again
        const diff = player.y - prevPlayerY
        for (let i = 0; i <= diff; i ++) {
          const isBad = !maze.isEmpty(player.x, player.y + player.height-1 - i) &&
             !maze.isEmpty(player.x + player.width-1, player.y + player.height-1 - i)
          if (!isBad) {
            player.y -= i
            break;
          }
        }
      } else
      */
      {
        player.x = prevPlayerX
        player.y = prevPlayerY
      }
    }
  }
  maze.update(tick, player)
}

function draw(tick) {
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const halfPlayerWidth = Math.floor(player.width / 2)
  const halfPlayerHeight = Math.floor(player.height / 2)
  const playerPosX = Math.floor((canvas.width - player.width) / 2)
  const playerPosY = Math.floor((canvas.height - player.height) / 2)

  maze.draw(ctx, tick, player, player.x + halfPlayerWidth, player.y + halfPlayerHeight)
  player.draw(ctx, tick, playerPosX, playerPosY)


  // draw the hit detection
  /*
  const radius = 5
  ctx.fillStyle = 'red'
  if (hits.topLeft) {
    ctx.beginPath()
    ctx.arc(playerPosX, playerPosY, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  if (hits.topRight) {
    ctx.beginPath()
    ctx.arc(playerPosX + player.width, playerPosY, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  if (hits.bottomLeft) {
    ctx.beginPath()
    ctx.arc(playerPosX, playerPosY + player.height, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  if (hits.bottomRight) {
    ctx.beginPath()
    ctx.arc(playerPosX + player.width, playerPosY + player.height, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  */
}

function loop(tick) {
  update(tick)
  draw(tick)
  requestAnimationFrame(loop)
}

function onKeyUp(e) {
  KEYS_DOWN.delete(e.which)
}

function onKeyDown(e) {
  KEYS_DOWN.add(e.which)
}

function onResize(e) {
  const { innerWidth, innerHeight } = (e?.target || window)
  canvas.width = innerWidth
  canvas.height = innerHeight
}

(function init() {
  console.log('Panda Maze')
  console.log('~~~~~~~~~~')

  maze = new Maze()

  maze.load().then(() => {
    const { x: startX, y: startY } = maze.playerStart
    player = new Player(startX, startY, maze.stars.length)

    // Setup key event handlers
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    onResize()

    requestAnimationFrame(loop)
  })
})()