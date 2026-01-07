import { state, canvas, overlay, CHUNK_SIZE } from "./state.js"
import { FractalNoise } from "./noise.js"
import { clamp } from "./util.js"
import { bilinearInterpolation } from "./scale.js"
import { MouseEditorState } from "./state_option.js"

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
const overlayCtx = overlay.getContext("2d")

function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()
  state.ui.width = Math.ceil(editorRect.width)
  state.ui.height = Math.ceil(editorRect.height)

  canvas.width = state.ui.width
  canvas.height = state.ui.height

  overlay.width = state.ui.width
  overlay.height = state.ui.height

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, state.ui.width, state.ui.height)
}

getActualCanvasSize()


export function drawMap() {
  if (state.ui.mode != MouseEditorState.SelectDrag) {
    return
  }

  const worldYMin = Math.min(state.ui.y0, state.ui.y1)
  const worldYMax = Math.max(state.ui.y0, state.ui.y1)

  const worldXMin = Math.min(state.ui.x0, state.ui.x1)
  const worldXMax = Math.max(state.ui.x0, state.ui.x1)

  const height = worldYMax - worldYMin
  const width = worldXMax - worldXMin

  state.view.dirty = true
  const imageData = ctx.createImageData(width, height)

  let imageIndex = 0
  console.log(height, width, "Draw Map")
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const worldX = x + worldXMin
      const worldY = y + worldYMin

      const cx = Math.floor(worldX / CHUNK_SIZE)
      const cy = Math.floor(worldY / CHUNK_SIZE)

      const key = cx + "," + cy

      let value = 0
      const chunk = state.world.chunks.get(key)
      if (chunk) {
        const lx = Math.floor(worldX - cx * CHUNK_SIZE)
        const ly = Math.floor(worldY - cy * CHUNK_SIZE)
        const chunkLocalIndex = Math.floor(ly * CHUNK_SIZE + lx)

        value = chunk.data[chunkLocalIndex]
      }
      value = (value + 1) * 0.5
      const n = clamp(value * 255 | 0, 0, 255)
      imageData.data[imageIndex++] = n
      imageData.data[imageIndex++] = n
      imageData.data[imageIndex++] = n
      imageData.data[imageIndex++] = 255
    }
  }

  let x = Math.min(state.ui.x0, state.ui.x1)
  let y = Math.min(state.ui.y0, state.ui.y1)

  const offscreen = new OffscreenCanvas(width, height)

  const offctx = offscreen.getContext("2d")
  offctx.imageSmoothingEnabled = false
  offctx.putImageData(imageData, 0, 0)


  const chunk = {
    x: x,
    y: y,
    width, height,
    offscreen,
  }

  state.view.chunkOrders.set(`${x},${y}`, chunk)

  requestRedraw({ world: true })
}

export function mapGenerator(option) {
  if (state.ui.mode != MouseEditorState.SelectDrag) return

  const { permutationTable } = state.world

  const worldYMin = Math.min(state.ui.y0, state.ui.y1)
  const worldYMax = Math.max(state.ui.y0, state.ui.y1)

  const worldXMin = Math.min(state.ui.x0, state.ui.x1)
  const worldXMax = Math.max(state.ui.x0, state.ui.x1)

  const height = worldYMax - worldYMin
  const width = worldXMax - worldXMin

  // const SCALE = 1
  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      const worldX = Math.floor(worldXMin + sx)
      const worldY = Math.floor(worldYMin + sy)

      const noise = FractalNoise(worldX, worldY, permutationTable, option)

      writeToChunk(worldX, worldY, noise)
    }
  }
}

function writeToChunk(worldX, worldY, noise) {
  const cx = Math.floor(worldX / CHUNK_SIZE)
  const cy = Math.floor(worldY / CHUNK_SIZE)

  const key = cx + "," + cy
  let chunk = state.world.chunks.get(key)
  if (!chunk) {
    const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    chunk = { cx: cx, cy: cy, data: float32, dirty: false, occupied: uint8 }
    state.world.chunks.set(key, chunk)
  }

  const lx = Math.floor(worldX - cx * CHUNK_SIZE)
  const ly = Math.floor(worldY - cy * CHUNK_SIZE)
  const index = Math.floor(ly * CHUNK_SIZE + lx)
  chunk.data[index] = noise
  chunk.occupied[index] = 1
}

function drawWorld() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  ctx.translate(-cam.x * zoom, -cam.y * zoom)

  ctx.scale(zoom, zoom)

  for (const chunk of state.view.chunkOrders.values()) {
    ctx.drawImage(chunk.offscreen, chunk.x, chunk.y)
  }
}

function drawOverlay() {
  overlayCtx.setTransform(1, 0, 0, 1, 0, 0)
  overlayCtx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  overlayCtx.translate(-cam.x * zoom, -cam.y * zoom)
  overlayCtx.scale(zoom, zoom)

  if (state.ui.mode == MouseEditorState.SelectDrag) {
    const x0 = (state.ui.x0)
    const y0 = (state.ui.y0)

    const x1 = (state.ui.x1)
    const y1 = (state.ui.y1)

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

export function loadViewStateFromSavedState(newState) {
  const worldState = newState.world
  const chunkOrders = new Map()
  for (const chunk of worldState.chunks.values()) {
    const pixels = new Uint8ClampedArray(CHUNK_SIZE * CHUNK_SIZE * 4)

    let index = 0
    for (let i = 0; i < chunk.data.length; i++) {
      const data = chunk.data[i];
      const occupied = chunk.occupied[i]

      let value = clamp(data * 255 | 0, 0, 255)
      if (occupied == 0) {
        value = 255
      }

      pixels[index++] = value
      pixels[index++] = value
      pixels[index++] = value
      pixels[index++] = 255
    }

    const imageData = new ImageData(pixels, CHUNK_SIZE, CHUNK_SIZE)
    const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
    const offCtx = offscreen.getContext("2d")

    offCtx.putImageData(imageData, 0, 0)

    const x = chunk.cx * CHUNK_SIZE
    const y = chunk.cy * CHUNK_SIZE

    const key = `${chunk.cx},${chunk.cy}`

    chunkOrders.set(key, {
      x: x,
      y: y,
      width: CHUNK_SIZE,
      height: CHUNK_SIZE,
      offscreen: offscreen
    })
  }

  state.view.chunkOrders = chunkOrders

  requestRedraw({ world: true })
}
