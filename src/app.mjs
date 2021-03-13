// app.js

// add breadcrumbs on demand (drop and not drop); bonus: add the ability to pick up
// fix the collision detection with the walls to be less aggressive
// add a timer (for consequence or for points to beat as a score)

// TODO: fix collision detection
// TODO: add start menu (and trigger music on interaction)
// TODO: add support for going to next level
// TODO: add end-state (collected all stars)

// TODO: add door interation (animation and trigger)
// TODO: add animations (juice)

// TODO: create level editor
// TODO: add a challenge (time limit, or enemy)

import Game from './Game.mjs'

// TODO: create a music class and add it to Game
// Music from https://opengameart.org/content/rpg-ambient-3
/*
const MUSIC_URL = 'assets/music.mp3'
let music = new Audio(MUSIC_URL)
music.volume = 0.2 // 20% of max volume
window.music = music
*/
// TODO: music.play() once there is interaction

console.log('Panda Maze')
console.log('~~~~~~~~~~')
new Game('canvas')
