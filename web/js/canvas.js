import { state, canvas, overlay, CHUNK_SIZE, undoEntry, redoEntry } from "./state.js"
import { FractalNoise } from "./noise.js"
import { clamp } from "./util.js"
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

  state.view.dirty = true

  for (const [coordinate, worldChunk] of state.world.chunks.entries()) {
    if (!worldChunk.dirty) return

    const imageData = ctx.createImageData(CHUNK_SIZE, CHUNK_SIZE)
    let idxData = 0;

    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const index = ly * CHUNK_SIZE + lx
        let value = worldChunk.data[index]
        const occupied = worldChunk.occupied[index]

        value = (value + 1) * 0.5
        value = clamp(value * 255 | 0, 0, 255)
        if (occupied == 0) {
          value = 255
        }

        imageData.data[idxData++] = value
        imageData.data[idxData++] = value
        imageData.data[idxData++] = value
        imageData.data[idxData++] = 255
      }
    }

    let viewChunk = state.view.chunkOrders.get(coordinate)
    if (!viewChunk) {
      const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
      viewChunk = { offscreen, dirty: false }
      state.view.chunkOrders.set(coordinate, viewChunk)
    }

    const context = viewChunk.offscreen.getContext("2d")
    context.imageSmoothingEnabled = false
    context.putImageData(imageData, 0, 0)

    worldChunk.dirty = false
  }

  undoEntry.push(structuredClone(state.affectedChunks))
  state.affectedChunks.clear()
  requestRedraw({ world: true, overlay: true })
}

export function mapGenerator(option) {
  if (state.ui.mode != MouseEditorState.SelectDrag) return

  const { permutationTable } = state.world

  let worldYMin = Math.min(state.ui.y0, state.ui.y1)
  let worldYMax = Math.max(state.ui.y0, state.ui.y1)

  let worldXMin = Math.min(state.ui.x0, state.ui.x1)
  let worldXMax = Math.max(state.ui.x0, state.ui.x1)

  worldYMax = Math.ceil(worldYMax)
  worldXMax = Math.ceil(worldXMax)

  worldYMin = Math.floor(worldYMin)
  worldXMin = Math.floor(worldXMin)

  const height = worldYMax - worldYMin
  const width = worldXMax - worldXMin

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
    chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
    state.world.chunks.set(key, chunk)
  }

  const lx = Math.floor(worldX - cx * CHUNK_SIZE)
  const ly = Math.floor(worldY - cy * CHUNK_SIZE)
  const index = Math.floor(ly * CHUNK_SIZE + lx)

  const prevChunk = chunk.data[index]
  const currentChunk = noise

  let affectedChunk = state.affectedChunks.get(key)
  if (!affectedChunk) {
    affectedChunk = new Map()
    state.affectedChunks.set(key, affectedChunk)
  }

  const localChunk = affectedChunk.get(index)
  if (!localChunk) {
    const change = {
      before: prevChunk,
      after: currentChunk
    }

    affectedChunk.set(index, change)
  }

  chunk.data[index] = currentChunk
  chunk.dirty = true
  chunk.occupied[index] = 1
}

function drawWorld() {
  // Reset Screen Canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  const tx = Math.round(-cam.x * zoom)
  const ty = Math.round(-cam.y * zoom)

  ctx.imageSmoothingEnabled = false

  // Apply Camere Position
  ctx.setTransform(zoom, 0, 0, zoom, tx, ty)

  for (const [coordinate, chunk] of state.world.chunks.entries()) {
    const worldX = chunk.cx * CHUNK_SIZE
    const worldY = chunk.cy * CHUNK_SIZE

    let chunkView = state.view.chunkOrders.get(coordinate)

    if (chunkView && chunkView.dirty == false) {
      ctx.drawImage(chunkView.offscreen, worldX, worldY)
      continue
    }

    if (!chunkView) {
      const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
      chunkView = { offscreen, dirty: false }
      state.view.chunkOrders.set(coordinate, chunkView)
    }

    const offCtx = chunkView.offscreen.getContext("2d")
    offCtx.imageSmoothingEnabled = false
    offCtx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE)

    const imageData = offCtx.getImageData(0, 0, CHUNK_SIZE, CHUNK_SIZE)
    let pixels = imageData.data

    let index = 0
    for (let i = 0; i < chunk.data.length; i++) {
      let data = chunk.data[i];
      const occupied = chunk.occupied[i]

      data = (data + 1) * 0.5
      let value = clamp(data * 255 | 0, 0, 255)
      if (occupied == 0) value = 255

      pixels[index++] = value
      pixels[index++] = value
      pixels[index++] = value
      pixels[index++] = 255
    }

    ctx.drawImage(chunkView.offscreen, worldX, worldY)

    chunkView.dirty = false
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
      let data = chunk.data[i];
      const occupied = chunk.occupied[i]

      data = (data + 1) * 0.5
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

    const key = `${chunk.cx},${chunk.cy}`

    chunkOrders.set(key, {
      offscreen: offscreen,
      dirty: false
    })
  }

  state.view.chunkOrders = chunkOrders

  requestRedraw({ world: true })
}

export function undo() {
  const affectedChunks = undoEntry.pop()
  if (!affectedChunks) {
    return
  }
  // console.log(affectedChunks)
  for (const [coordinate, localChunks] of affectedChunks.entries()) {
    const [cx, cy] = coordinate.split(",")
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth")

    for (const [index, change] of localChunks.entries()) {
      const prevChunk = change.before

      console.assert(chunk.occupied[index] != 0, "Something Wrong With Local Chunk Source Of Truth")

      chunk.data[index] = prevChunk
    }

    const cacheView = state.view.chunkOrders.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk View Cache")

    cacheView.dirty = true
  }

  redoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}
