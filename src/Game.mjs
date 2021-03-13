import InputHandler, { KEYS } from './InputHandler.mjs'
import Player from './Player.mjs'
import Maze from './Maze.mjs'

const GAME_TITLE = 'Panda Wander'
const TITLE_FONT_SIZE = 100 // pixels
const PRESS_ANY_KEY_TEXT = '[ press any key to start ]'
const PRESS_ANY_KEY_TEXT_FONT_SIZE = 30 // pixels
const BACKGROUND_COLOR = '#505050'
const BACKGROUND_IMAGE_URL = './assets/map-with-panda.png'

/*
Game states:
- running
- end
- levelup?
- menu
*/
const GAME_STATE__RUNNING = 'running'
const GAME_STATE__END = 'end'
const GAME_STATE__MENU = 'menu'
const GAME_STATES = [GAME_STATE__MENU, GAME_STATE__RUNNING, GAME_STATE__END]

class Game {
  constructor(canvasID) {
    const canvas = document.getElementById('canvas')
    this.ctx = canvas.getContext('2d', { alpha: true })

    this.input = new InputHandler()

    this.hits = {}

    this.backgroundImage = new Image()
    this.backgroundImage.src = BACKGROUND_IMAGE_URL

    this.maze = new Maze()
    this.maze.load().then(() => {
      const { x: startX, y: startY } = this.maze.playerStart
      this.player = new Player(startX, startY, this.maze.stars.length /* this smells; why does the player need to the know the maze's stars? */)
      requestAnimationFrame(this.loop)
    })

    this.setGameState = this.setGameState.bind(this)
    this.onResize = this.onResize.bind(this)
    this.loop = this.loop.bind(this)
    this.update = this.update.bind(this)
    this.draw = this.draw.bind(this)
    this.drawGameMenu = this.drawGameMenu.bind(this)
    this.drawGameRunning = this.drawGameRunning.bind(this)
    this.drawGameEnd = this.drawGameEnd.bind(this)

    window.addEventListener('resize', this.onResize)
    this.onResize()

    this.setGameState(GAME_STATE__MENU)
  }

  setGameState(gameState) {
    if (!GAME_STATES.includes(gameState)) {
      throw new Error(`Invalid game state "${gameState}"; expected one of: ${GAME_STATES.join(', ')}`)
    }
    this.gameState = gameState
    switch (gameState) {
      case GAME_STATE__MENU:
      case GAME_STATE__RUNNING:
      case GAME_STATE__END:
        break;
      default:
        throw new Error('Unexpected case')
    }
  }

  onResize(e) {
    const { innerWidth, innerHeight } = (e?.target ?? window)
    this.ctx.canvas.width = innerWidth
    this.ctx.canvas.height = innerHeight
  }

  update(tick) {
    const { player, input, maze, hits, gameState } = this

    if (gameState === GAME_STATE__MENU) {
      if (input.pressedAnyKey()) {
        this.setGameState(GAME_STATE__RUNNING)
      }
      return
    }

    const isPlayerMoving = input.pressedOneOf([
      KEYS.DOWN, KEYS.UP, KEYS.LEFT, KEYS.RIGHT,
      KEYS.S, KEYS.W, KEYS.A, KEYS.D
    ])
    player.isMoving = isPlayerMoving
    if (isPlayerMoving) {
      const prevPlayerX = player.x
      const prevPlayerY = player.y

      const hasPressedDown = input.pressedOneOf([KEYS.DOWN, KEYS.S])
      if (hasPressedDown) {
        player.move('down')
      }

      const hasPressedUp = input.pressedOneOf([KEYS.UP, KEYS.W])
      if (hasPressedUp) {
        player.move('up')
      }

      const hasPressedLeft = input.pressedOneOf([KEYS.LEFT, KEYS.A])
      if (hasPressedLeft) {
        player.move('left')
      }

      const hasPressedRight = input.pressedOneOf([KEYS.RIGHT, KEYS.D])
      if (hasPressedRight) {
        player.move('right') // PLAYER.move(PLAYER_DIRECTION.RIGHT)
      }

      // TODO: convert this to use player.undo()
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

  drawGameRunning(tick) {
    const { ctx, maze, player } = this

    const halfPlayerWidth = Math.floor(player.width / 2)
    const halfPlayerHeight = Math.floor(player.height / 2)
    const playerPosX = Math.floor((ctx.canvas.width - player.width) / 2)
    const playerPosY = Math.floor((ctx.canvas.height - player.height) / 2)

    maze.draw(ctx, tick, player, player.x + halfPlayerWidth, player.y + halfPlayerHeight)
    player.draw(ctx, tick, playerPosX, playerPosY)

    // draw the hit detection
    /*
    const { hits } = this
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

  drawGameMenu(tick) {
    const { ctx, backgroundImage } = this
    const halfScreenWidth = ctx.canvas.width >> 1
    const halfScreenHeight = ctx.canvas.height >> 1

    // draw background image (blurry map with panda), centered
    const backgroundImageHalfWidth = backgroundImage.width >> 1
    const backgroundImageHalfHeight = backgroundImage.height >> 1
    ctx.drawImage(backgroundImage,
      Math.max(0, backgroundImageHalfWidth - halfScreenWidth),
      Math.max(0, backgroundImageHalfHeight - halfScreenHeight),
      ctx.canvas.width, ctx.canvas.height,
      0, 0, ctx.canvas.width, ctx.canvas.height
    )

    // draw a dark band behind the text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    const titlePadding = 35
    ctx.fillRect(0, halfScreenHeight - TITLE_FONT_SIZE - titlePadding, ctx.canvas.width, TITLE_FONT_SIZE + PRESS_ANY_KEY_TEXT_FONT_SIZE + (titlePadding * 2))

    // draw the title, and press any key text
    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4

    // draw the text with an outline
    ctx.font = `${TITLE_FONT_SIZE}px Luminari, fantasy`
    ctx.strokeText(GAME_TITLE, halfScreenWidth, halfScreenHeight - TITLE_FONT_SIZE)
    ctx.fillText(GAME_TITLE, halfScreenWidth, halfScreenHeight - TITLE_FONT_SIZE)
    ctx.font = `${PRESS_ANY_KEY_TEXT_FONT_SIZE}px JetBrains Mono`
    ctx.strokeText(PRESS_ANY_KEY_TEXT, halfScreenWidth, halfScreenHeight)
    ctx.fillText(PRESS_ANY_KEY_TEXT, halfScreenWidth, halfScreenHeight)
  }

  drawGameEnd(tick) {
    // TODO: draw some game-over text
  }

  draw(tick) {
    const { ctx, gameState, drawGameMenu, drawGameRunning, drawGameEnd } = this

    // clear the background
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // call the respective draw method based on game state
    const drawMethods = {
      [GAME_STATE__MENU]: drawGameMenu,
      [GAME_STATE__RUNNING]: drawGameRunning,
      [GAME_STATE__END]: drawGameEnd
    }
    const drawMethod = drawMethods[gameState]
    if (typeof drawMethod === 'function') {
      drawMethod(tick)
    } else {
      throw new Error(`Invalid draw method for game state: ${gameState}`)
    }
  }

  loop(tick) {
    const { update, draw, loop } = this
    update(tick)
    draw(tick)
    requestAnimationFrame(loop)
  }
}

export default Game
