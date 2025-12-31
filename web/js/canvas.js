import { canvasState, editorState, canvas, overlay } from "./state.js"
import { FractalNoise } from "./noise.js"
import { clamp } from "./util.js"
import { bilinearInterpolation } from "./scale.js"
import { MouseEditorState } from "./state_option.js"

const ctx = canvas.getContext("2d")
const overlayCtx = overlay.getContext("2d")

function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()
  canvasState.width = Math.ceil(editorRect.width)
  canvasState.height = Math.ceil(editorRect.height)

  canvas.width = canvasState.width
  canvas.height = canvasState.height

  overlay.width = canvasState.width
  overlay.height = canvasState.height

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, canvasState.width, canvasState.height)
}

getActualCanvasSize()

export function drawMap() {
  if (editorState.state != MouseEditorState.SelectDrag) {
    return
  }

  const { map } = canvasState

  // Times by Zoom to get original width and height
  const width = Math.abs(editorState.x1 - editorState.x0)
  const height = Math.abs(editorState.y1 - editorState.y0)

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

  let x = Math.min(editorState.x0, editorState.x1)
  let y = Math.min(editorState.y0, editorState.y1)

  const offscreen = new OffscreenCanvas(width, height)

  const offcvs = offscreen.getContext("2d")
  offcvs.putImageData(imageData, 0, 0)

  const chunk = {
    x: x,
    y: y,
    width, height,
    offscreen,
    imageData
  }

  canvasState.chunkOrders.push(chunk)
  canvasState.chunkAccess.set(`${editorState.x0},${editorState.y0}`, chunk)

  requestRedraw({ world: true })
}

export function mapGenerator(option) {
  if (editorState.state != MouseEditorState.SelectDrag) return

  const width = Math.abs(editorState.x1 - editorState.x0)
  const height = Math.abs(editorState.y1 - editorState.y0)

  const { permutationTable } = canvasState

  let noises = []

  let max = -Infinity
  let min = Infinity

  const sampleHeight = Math.floor(height / 2)
  const sampleWidth = Math.floor(width / 2)

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

function drawWorld() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvasState.width, canvasState.height)

  const cam = canvasState.editorState.camera
  const zoom = canvasState.editorState.zoom

  ctx.translate(-cam.x * zoom, -cam.y * zoom)
  ctx.scale(zoom, zoom)

  for (let i = 0; i < canvasState.chunkOrders.length; i++) {
    const chunk = canvasState.chunkOrders[i];

    ctx.drawImage(chunk.offscreen, chunk.x, chunk.y)
  }
}

function drawOverlay() {
  overlayCtx.setTransform(1, 0, 0, 1, 0, 0)
  overlayCtx.clearRect(0, 0, canvasState.width, canvasState.height)

  const cam = canvasState.editorState.camera
  const zoom = canvasState.editorState.zoom

  overlayCtx.translate(-cam.x * zoom, -cam.y * zoom)
  overlayCtx.scale(zoom, zoom)

  if (editorState.state == MouseEditorState.SelectDrag) {
    const x0 = (editorState.x0)
    const y0 = (editorState.y0)

    const x1 = (editorState.x1)
    const y1 = (editorState.y1)

    overlayCtx.strokeStyle = "rgba(0,0,255,0.8)"
    overlayCtx.strokeRect(x0, y0, x1 - x0, y1 - y0)
  }
}

let redrawWorld = false
let redrawOverlay = false
let needsRedraw = false

export function requestRedraw({ world = false, overlay = false } = {}) {
  redrawWorld ||= world
  redrawOverlay ||= overlay

  if (!needsRedraw) {
    needsRedraw = true
    requestAnimationFrame(frame)
  }
}
function frame() {
  if (redrawWorld) drawWorld()
  if (redrawOverlay) drawOverlay()

  redrawWorld = false
  redrawOverlay = false
  needsRedraw = false
}

export function drawCanvasFromLoadedState(state) {
  const newChunkState = []

  for (let i = 0; i < state.chunkOrders.length; i++) {
    const chunk = state.chunkOrders[i];

    const imageData = ctx.createImageData(chunk.width, chunk.height)

    imageData.data.set(new Uint8ClampedArray(chunk.imageData))

    ctx.putImageData(imageData, chunk.x - state.editorState.camera.x, chunk.y - state.editorState.camera.y)

    const offscreen = new OffscreenCanvas(chunk.width, chunk.height)

    const offContext = offscreen.getContext("2d")

    offContext.putImageData(imageData, 0, 0)

    const newChunk = { ...chunk, imageData: imageData, offscreen: offscreen }
    newChunkState.push(newChunk)
    state.chunkAccess.set(`${chunk.x},${chunk.y}`, newChunk)
  }

  state.chunkOrders = newChunkState

  return state
}
