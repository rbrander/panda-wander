// This file represents the door sprite
import Sprite from './Sprite.js'

// door image obtained from https://opengameart.org/content/door-0
const DOOR_SPRITE_URL = './assets/door.png'
const SPRITE_HEIGHT = 32 // px
const SPRITE_WIDTH = 16 // px
const SCALE = 3
const NUM_FRAMES = 5 // each frame is to the right of the previous

class Door {
  constructor() {
    this.doorSprite = undefined
  }

  load() {
    return new Promise((resolve) => {
      const imgDoor = new Image()
      imgDoor.onload = () => {
        this.doorSprite = new Sprite(imgDoor, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT, SCALE)
        resolve(this)
      }
      imgDoor.src = DOOR_SPRITE_URL
      // TODO: load all the frames
    })
  }

  draw(ctx, x, y) {
    if (this.doorSprite) {
      this.doorSprite.draw(ctx, x, y)
    }
  }
}

export default Door