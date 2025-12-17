import { FractalNoise, NewPermutationTable } from "./noise.js"
import { sfc32 } from "./random.js"
import { debounce } from "./util.js"

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const editor = document.getElementById("editor")

let mapWidth = 500
let mapHeight = 500
const tileSize = 1

let editorState = {
  seed1: null,
  seed2: null,
  seed3: null,
  seed4: null,
  map: []
}

/**
 * @type {ImageData}
 */
let ctxImageData = null

// This Function is Get Actual Canvas Size Because There's A DOM to consider and it follow the size of browser
function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  mapWidth = Math.ceil(editorRect.width)
  mapHeight = Math.ceil(editorRect.height)

  canvas.width = mapWidth
  canvas.height = mapHeight

  ctxImageData = ctx.createImageData(mapWidth, mapHeight)
}

function drawMap() {
  const { map } = editorState

  console.time("Render To Canvas")
  let index = 0
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const grid = map[y][x]
      const n = grid * 255 | 0
      ctxImageData.data[index++] = n
      ctxImageData.data[index++] = n
      ctxImageData.data[index++] = n
      ctxImageData.data[index++] = 255
    }
  }

  ctx.putImageData(ctxImageData, 0, 0)
  console.timeEnd("Render To Canvas")
}

let option = {}

generateMap.addEventListener("click", () => {
  document.querySelectorAll(".generator .form-input input[type=range]").forEach(input => {
    const key = input.dataset.key
    const value = parseFloat(input.value)
    option[key] = value
  })

  mapGenerator(option)
  drawMap()
})

const inputGenerator = document.querySelectorAll(".generator .form-input input")

const inputControl = debounce(ev => {
  const source = ev.target
  const wrapper = source.closest(".form-input")
  const value = parseFloat(source.value)
  const key = source.dataset.key

  wrapper.querySelectorAll("input").forEach(el => {
    if (el !== source) el.value = value
  })

  option[key] = value
  mapGenerator(option)
  drawMap()
}, 500)

inputGenerator.forEach(input => {
  input.addEventListener("input", inputControl)
})

function mapGenerator(options) {

  const genSeed = () => (Math.random() * 2 ** 32) >> 0

  editorState.seed1 = genSeed()
  editorState.seed2 = genSeed()
  editorState.seed3 = genSeed()
  editorState.seed4 = genSeed()

  const rand = sfc32(editorState.seed1, editorState.seed2, editorState.seed3, editorState.seed4)

  const perm = NewPermutationTable(rand)

  let noises = []

  let max = -Infinity
  let min = Infinity

  options.canvasWidth = canvas.width
  options.canvasHeight = canvas.height

  console.time("Generator Speed")
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

  editorState.map = normalizeNoise(noises, min, max)

  console.timeEnd("Generator Speed")
}

/**
  *
  * @description Convert the Map from -1 to 1 into 0 - 1
  */
function normalizeNoise(noises, min, max) {
  const range = max - min

  for (let y = 0; y < noises.length; y++) {
    for (let x = 0; x < noises[y].length; x++) {
      noises[y][x] = (noises[y][x] - min) / range
    }
  }

  return noises
}

getActualCanvasSize()
