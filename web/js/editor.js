import { FractalNoise, defaultFractalOption, NewPermutationTable } from "./noise.js"
import { sfc32 } from "./random.js"
import { Noise2D } from "./test.js"

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const editor = document.getElementById("editor")

let mapWidth = 500
let mapHeight = 500
const tileSize = 1

let map = []

// This Function is Get Actual Canvas Size Because There's A DOM to consider and it follow the size of browser
function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  mapWidth = Math.ceil(editorRect.width)
  mapHeight = Math.ceil(editorRect.height)

  canvas.width = mapWidth
  canvas.height = mapHeight
}

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const grid = map[y][x]
      const n = grid * 255 | 0
      ctx.fillStyle = `rgba(${n}, ${n}, ${n}, 1)`
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    }
  }
}


function mapGenerator() {
  const genSeed = () => (Math.random() * 2 ** 32) >> 0
  const rand = sfc32(genSeed(), genSeed(), genSeed(), genSeed())

  const perm = NewPermutationTable(rand)

  let noises = []

  let max = -Infinity
  let min = Infinity

  let options = { ...defaultFractalOption }

  for (let y = 0; y < mapHeight; y++) {
    noises[y] = []
    for (let x = 0; x < mapWidth; x++) {
      const noise = FractalNoise(x, y, perm, options)

      if (noise > max) {
        max = noise
      }

      if (noise < min) {
        min = noise
      }

      noises[y][x] = noise
    }
  }

  console.log("MAX:", max, "MIN:", min)

  map = noises
}

function test() {
  let noises = []
  for (let y = 0; y < 500; y++) {
    noises[y] = []
    for (let x = 0; x < 500; x++) {
      let n = 0.0,
        a = 1.0,
        f = 0.005;
      for (let o = 0; o < 8; o++) {
        let v = a * Noise2D(x * f, y * f);
        n += v;

        a *= 0.5;
        f *= 2.0;
      }

      // n += 1.0;
      // n *= 0.5;
      noises[y][x] = n
    }
  }

  map = noises
}

getActualCanvasSize()
mapGenerator()
// test()
drawMap()
