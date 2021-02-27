import Sprite from './Sprite.mjs'

const STAR_COIN_URL = 'assets/star-coin.png'
const STAR_COIN_SIZE = 48

// Coin sound from https://opengameart.org/content/10-8bit-coin-sounds (coin7)
const COIN_SOUND_URL = 'assets/coin.wav'

// Panda sprite found at: https://opengameart.org/content/panda-character-32x32

const PANDA_URL = 'assets/Panda.png'
const PANDA_TILE_SIZE = 32 // pixels
const MS_PER_FRAME = 80 // milliseconds

class Player {
  constructor(x = 0, y = 0, totalStars = 0) {
    this.isMoving = false
    this.direction = 'down'
    this.speed = 3
    this.scale = 3.0 // 3x times the original size = 3 x 32 = 96px
    this.x = x
    this.y = y
    this.totalStars = totalStars
    this.numStarsCollected = 0
    this.width = Math.floor(PANDA_TILE_SIZE * this.scale)
    this.height = Math.floor(PANDA_TILE_SIZE * this.scale)
    this.coinSound = new Audio(COIN_SOUND_URL)

    this.starSprite = undefined
    Sprite.fromImage(STAR_COIN_URL, STAR_COIN_SIZE, STAR_COIN_SIZE)
      .then(star => this.starSprite = star)

    // Sprite will be a panda
    this.pandaSprites = {
      down: [],
      up: [],
      right: [],
      left: []
    }
    // Spritesheet for the panda is stored here
    this.imgPanda = new Image()
    this.imgPanda.onload = function() {
      /*
       * Sprite Sheet Layout has 5 rows, 2-3 columns:
       * F F
       * F F F
       * B B B
       * S S S
       * S S
       *
       * Where: F = front-profile, B = back-profile, and S = side-profile
       *
       * NOTE: I'm not sure what the first and last row are for, so I'm ignoring them.
       *       Also, since there is only one side, I use that side to generate the opposite side
       */
      const rowDirections = ['down', 'down', 'up', 'right', 'right']
      for (let row = 1; row <= 3; row++) { // ignore first row and last row; just middle 3 rows
        let spriteY = row * PANDA_TILE_SIZE
        for (let col = 0; col < 3; col++) {
          let spriteX = col * PANDA_TILE_SIZE
          const direction = rowDirections[row]
          const sprite = new Sprite(this.imgPanda, spriteX, spriteY, PANDA_TILE_SIZE, PANDA_TILE_SIZE, this.scale)
          this.pandaSprites[direction].push(sprite)
        }
      }

      // Create sprites for moving left (using the side-profile sprites on the fourth row)
      // The sprites on the fourth row are flipped horizontally
      for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas')
        const canvasSize = Math.floor(PANDA_TILE_SIZE * this.scale)
        canvas.width = canvasSize
        canvas.height = canvasSize

        // Flip the image by reversing the scale and drawing the image backwards (using -widith)
        const ctx = canvas.getContext('2d', { alpha: true })
        ctx.save()
        ctx.scale(-1, 1)
        ctx.imageSmoothingEnabled = false // disable anti-alaising
        ctx.drawImage(this.imgPanda,
          i * PANDA_TILE_SIZE, 3 * PANDA_TILE_SIZE, PANDA_TILE_SIZE, PANDA_TILE_SIZE,
          0, 0, -canvas.width, canvas.height
        )
        ctx.restore()

        // Create a new sprite using the canvas
        const sprite = new Sprite(canvas, 0, 0, canvasSize, canvasSize)
        this.pandaSprites.left.push(sprite)
      }
    }.bind(this)
    this.imgPanda.src = PANDA_URL // NOTE: setting src after onload is set to ensure onload exists prior to loading
  }

  move(direction) {
    this.direction = direction
    switch (direction) {
      case 'up':
        this.y -= this.speed
        break;
      case 'down':
        this.y += this.speed
        break;
      case 'left':
        this.x -= this.speed
        break;
      case 'right':
        this.x += this.speed
        break;
      default:
        this.direction = 'down'
        break;
    }
  }

  draw(ctx, tick, x, y) {
    const frameCount = ~~(tick / MS_PER_FRAME)
    const pandaFrames = [1, 0, 2, 0] // right foot (frame 1), both feet (frame 0), left foot (frame 2), both feet (frame 0)
    const frame = frameCount % pandaFrames.length
    const pandaFrame = this.isMoving ? pandaFrames[frame] : 0
    const sprite = this.pandaSprites[this.direction][pandaFrame]
    if (sprite) {
      sprite.draw(ctx, x, y)
    }

    // draw the score at the top in the middle
    if (this.starSprite !== undefined) {
      // set font settings prior to measuring the text
      ctx.font = `${this.starSprite.height}px JetBrains Mono`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      // calculate the box that surrounds the text and coin sprite
      const scoreText = `${this.numStarsCollected} / ${this.totalStars} `
      const scoreTextWidth = ctx.measureText(scoreText).width
      const boxLineHeight = 1.5 // multiplier of minimal height
      const boxWidth = scoreTextWidth + this.starSprite.width
      const boxHeight = this.starSprite.height * boxLineHeight
      const halfWidth = canvas.width >> 1
      const boxLeft = halfWidth - (boxWidth >> 1)
      const boxTop = 25 // pixels
      const textX = halfWidth - (this.starSprite.width >> 1)
      const textY = boxTop + (boxHeight >> 1)

      // background, semi-transparent
      ctx.fillStyle = '#cccccc77'
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      ctx.moveTo(boxLeft, boxTop)
      ctx.lineTo(boxLeft + boxWidth, boxTop)
      ctx.arc(boxLeft + boxWidth, boxTop + (boxHeight >> 1), (boxHeight >> 1), -Math.PI/2, Math.PI/2, false)
      ctx.moveTo(boxLeft + boxWidth, boxTop + boxHeight)
      ctx.lineTo(boxLeft, boxTop + boxHeight)
      ctx.arc(boxLeft, boxTop + (boxHeight >> 1), (boxHeight >> 1), Math.PI/2, -Math.PI/2, false)
      ctx.fill()
      ctx.stroke()

      // score text in solid white
      ctx.fillStyle = '#fff'
      ctx.fillText(scoreText, textX, textY)
      this.starSprite.draw(ctx, boxLeft + boxWidth - this.starSprite.width, boxTop + (boxHeight - this.starSprite.height >> 1))
    }
  }

  // does a check and returns the result; if true score increases
  collidesWithStar({ x, y, width, height }) {
    const overlapsWithPlayer = (
      (x + width >= this.x && this.x + this.width >= x) &&
      (y + height >= this.y && this.y + this.height >= y)
    )
    if (overlapsWithPlayer) {
      this.numStarsCollected++
      // this.speed += 1
      this.coinSound.play()
    }
    return overlapsWithPlayer
  }
}

export default Player