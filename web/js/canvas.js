import { canvasState } from "./state.js"
import { FractalNoise } from "./noise.js"
import { clamp } from "./util.js"
import { bilinearInterpolation } from "./scale.js"

let offscreen

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  canvasState.width = Math.ceil(editorRect.width)
  canvasState.height = Math.ceil(editorRect.height)

  canvas.width = canvasState.width
  canvas.height = canvasState.height

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, canvasState.width, canvasState.height)
}

getActualCanvasSize()

export function drawMap() {
  const { map, width, height } = canvasState

  canvasState.dirty = true

  const imageData = ctx.createImageData(width, height)

  const scaledMap = bilinearInterpolation(map, width, height)
  let index = 0
  for (let y = 0; y < scaledMap.length; y++) {
    for (let x = 0; x < scaledMap[y].length; x++) {
      const grid = scaledMap[y][x]
      const n = clamp(grid * 255 | 0, 0, 255)
      imageData.data[index++] = n
      imageData.data[index++] = n
      imageData.data[index++] = n
      imageData.data[index++] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  offscreen = new OffscreenCanvas(width, height);
  const offcvs = offscreen.getContext("2d")
  offcvs.putImageData(imageData, 0, 0)
}

export function mapGenerator(option) {
  const { permutationTable, width, height } = canvasState

  let noises = []

  let max = -Infinity
  let min = Infinity

  const sampleHeight = Math.floor(height / 3)
  const sampleWidth = Math.floor(width / 3)

  for (let y = 0; y < sampleHeight; y++) {
    noises[y] = []
    for (let x = 0; x < sampleWidth; x++) {
      const noise = FractalNoise(x, y, permutationTable, option)

      if (noise > max) {
        max = noise
      }

      if (noise < min) {
        min = noise
      }

      noises[y][x] = noise
    }
  }
  canvasState.map = normalizeNoise(noises, min, max)
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

function draw(_) {
  ctx.clearRect(0, 0, canvasState.width, canvasState.height)

  ctx.drawImage(offscreen, canvasState.offsetX, canvasState.offsetY)
}

let needsRedraw = false

function scheduleDraw() {
  if (!needsRedraw) {
    needsRedraw = true
    requestAnimationFrame((timestamp) => {
      draw(timestamp)
      needsRedraw = false
    })
  }
}

window.addEventListener("request-redraw", scheduleDraw)
