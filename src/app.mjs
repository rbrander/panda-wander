// app.js

// add breadcrumbs on demand (drop and not drop); bonus: add the ability to pick up
// fix the collision detection with the walls to be less aggressive
// add a timer (for consequence or for points to beat as a score)

// TODO: add end-state (collected all stars)
// TODO: add a challenge (time limit, or enemy)
// TODO: create level editor
// TODO: add animations (juice)
// TODO: add door interation (animation and trigger)
// TODO: add support for going to next level

import InputHandler, { KEYS } from './InputHandler.mjs'
import Player from './Player.mjs'
import Maze from './Maze.mjs'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { alpha: true })
const BACKGROUND_COLOR = '#000'// '#505050'

// Music from https://opengameart.org/content/rpg-ambient-3
const MUSIC_URL = 'assets/music.mp3'
let music = new Audio(MUSIC_URL)
music.volume = 0.2 // 20% of max volume
window.music = music
// TODO: music.play() once there is interaction

let maze
let input
let player
const hits = {}

function update(tick) {
  player.isMoving = input.pressedOneOf([
    KEYS.DOWN, KEYS.UP, KEYS.LEFT, KEYS.RIGHT,
    KEYS.S, KEYS.W, KEYS.A, KEYS.D
  ])
  if (player.isMoving) {
    const prevPlayerX = player.x
    const prevPlayerY = player.y
    if (input.pressedOneOf([KEYS.DOWN, KEYS.S])) {
      player.move('down')
    }
    if (input.pressedOneOf([KEYS.UP, KEYS.W])) {
      player.move('up')
    }
    if (input.pressedOneOf([KEYS.LEFT, KEYS.A])) {
      player.move('left')
    }
    if (input.pressedOneOf([KEYS.RIGHT, KEYS.D])) {
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
      player.x = prevPlayerX
      player.y = prevPlayerY
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
}

function loop(tick) {
  update(tick)
  draw(tick)
  requestAnimationFrame(loop)
}

function onResize(e) {
  const { innerWidth, innerHeight } = (e?.target ?? window)
  canvas.width = innerWidth
  canvas.height = innerHeight
}

(function init() {
  console.log('Panda Maze')
  console.log('~~~~~~~~~~')

  input = new InputHandler()

  window.addEventListener('resize', onResize)
  onResize()

  maze = new Maze()
  maze.load().then(() => {
    const { x: startX, y: startY } = maze.playerStart
    player = new Player(startX, startY, maze.stars.length)
    requestAnimationFrame(loop)
  })
})()