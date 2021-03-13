export const KEYS = {
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

class InputHandler {
  // Keys are static in the event this class is implemented elsewhere
  static KEYS_DOWN = new Set()

  constructor() {
    // Handle the keyboard events
    document.addEventListener('keyup', this.onKeyUp)
    document.addEventListener('keydown', this.onKeyDown)
  }

  onKeyUp(e) {
    InputHandler.KEYS_DOWN.delete(e.which)
  }

  onKeyDown(e) {
    InputHandler.KEYS_DOWN.add(e.which)
  }

  pressedAnyKey() {
    return InputHandler.KEYS_DOWN.size > 0
  }

  pressedOneOf(keys) {
    // given a running result, and a key from the collection, check if the
    // key exists in the KEYS_DOWN set.  If any of the keys are down, the
    // result will be true
    return keys.reduce((result, key) => (result || InputHandler.KEYS_DOWN.has(key)), false)
  }
}

export default InputHandler
