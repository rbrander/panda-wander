// Sprite represents a square image
class Sprite {
  constructor(sourceImage, sourceX, sourceY, sourceWidth, sourceHeight, scale = 1.0) {
    // Create an offscreen canvas for drawing
    // for performance reasons so that scaling doesn't happen at draw-time
    this.canvas = document.createElement('canvas')
    this.canvas.width = Math.floor(sourceWidth * scale)
    this.canvas.height = Math.floor(sourceHeight * scale)
    const ctx = this.canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false // disable anti-alaising
    ctx.drawImage(sourceImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, this.canvas.width, this.canvas.height
    )

    this.width = this.canvas.width
    this.height = this.canvas.height
  }

  static fromImage(URL, width, height, scale = 1.0) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve(new Sprite(img, 0, 0, width, height, scale))
      }
      img.src = URL
    })
  }

  draw(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y)
  }
}

export default Sprite