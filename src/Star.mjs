import Sprite from './Sprite.mjs'

// star sprite found at: https://opengameart.org/content/coin-animation

// TODO: load star images globally; not on instance

const STAR_TILE_URL = 'assets/stars.png'
const NUM_STAR_FRAMES = 6
const STAR_TILE_SIZE = 48
const FRAMES_PER_SECOND = 12
const MS_PER_SECOND = 1000
const MS_PER_FRAME = MS_PER_SECOND / FRAMES_PER_SECOND

class Star {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = STAR_TILE_SIZE
    this.height = STAR_TILE_SIZE
    this.frames = []
    this.memo = {}

    this.loadAllFrames()
  }

  loadAllFrames() {
    const img = new Image()
    img.onload = () => {
      // All frames are in a single row
      for (let i = 0; i < NUM_STAR_FRAMES; i++) {
        const sprite = new Sprite(img, i * STAR_TILE_SIZE, 0, STAR_TILE_SIZE, STAR_TILE_SIZE)
        this.frames.push(sprite)
      }
    }
    img.src = STAR_TILE_URL
  }

  draw(ctx, tick, x, y) {
    // draw the current frame
    const frameIndex = Math.floor(tick / MS_PER_FRAME) % NUM_STAR_FRAMES
    const frame = this.frames[frameIndex]
    if (frame instanceof Sprite) {
      frame.draw(ctx, x, y)
    }
  }
}

export default Star