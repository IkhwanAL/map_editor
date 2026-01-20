import { state, canvas, overlay, CHUNK_SIZE, undoEntry, redoEntry, clearRedo } from "./state.js"
import { FractalNoise } from "./noise.js"
import { ToolState } from "./state_option.js"
import { createPixels, getChunkCoordinate, getLocalChunkCoordinate, getWorldCoordinate, updatePixels } from "./pixel.js"

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
  state.view.dirty = true

  for (const [coordinate, worldChunk] of state.world.chunks.entries()) {
    if (!worldChunk.dirty) continue

    const imageData = ctx.createImageData(CHUNK_SIZE, CHUNK_SIZE)
    createPixels(worldChunk, imageData.data)

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

  clearRedo()
  requestRedraw({ world: true })
}

export function mapGenerator(option) {
  const { permutationTable } = state.world

  const minX = state.world.x - state.ui.brush.radius
  const minY = state.world.y - state.ui.brush.radius

  const maxX = state.world.x + state.ui.brush.radius
  const maxY = state.world.y + state.ui.brush.radius

  const height = maxY - minY
  const width = maxX - minX

  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      const worldX = Math.floor(minX + sx)
      const worldY = Math.floor(minY + sy)

      const dx = worldX - state.world.x
      const dy = worldY - state.world.y

      const insideCircle = ((dx * dx) + (dy * dy)) <= (state.ui.brush.radius * state.ui.brush.radius)

      if (!insideCircle) continue

      const noise = FractalNoise(worldX, worldY, permutationTable, option)
      writeToChunk(worldX, worldY, noise)
    }
  }
}

function writeToChunk(worldX, worldY, noise) {
  const cx = getChunkCoordinate(worldX)
  const cy = getChunkCoordinate(worldY)

  const key = cx + "," + cy
  let chunk = state.world.chunks.get(key)
  if (!chunk) {
    const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
    state.world.chunks.set(key, chunk)
  }

  const lx = getLocalChunkCoordinate(worldX, cx)
  const ly = getLocalChunkCoordinate(worldY, cy)
  const index = Math.floor(ly * CHUNK_SIZE + lx)

  const prevChunk = chunk.data[index]
  const prevChunkStatus = chunk.occupied[index]
  const currentChunk = noise
  const currChunkStatus = 1

  let affectedChunk = state.affectedChunks.get(key)
  if (!affectedChunk) {
    affectedChunk = new Map()
    state.affectedChunks.set(key, affectedChunk)
  }

  const localChunk = affectedChunk.get(index)
  if (!localChunk) {
    const change = {
      before: prevChunk,
      beforeOccupied: prevChunkStatus,
      after: currentChunk,
      afterOccupied: currChunkStatus,
    }

    affectedChunk.set(index, change)
  }

  chunk.data[index] = currentChunk
  chunk.dirty = true
  chunk.occupied[index] = currChunkStatus
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
    const worldX = getWorldCoordinate(chunk.cx)
    const worldY = getWorldCoordinate(chunk.cy)

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
    updatePixels(chunk, imageData.data)

    offCtx.putImageData(imageData, 0, 0)
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

  switch (state.ui.tool) {
    case ToolState.BrushTool:
      // Create Full Circle Around Mouse
      const rad = state.ui.brush.radius
      overlayCtx.beginPath()
      overlayCtx.strokeStyle = "rgba(0,0,255, 0.6)"
      overlayCtx.arc(state.world.x, state.world.y, rad, 0, Math.PI * 2, false)
      overlayCtx.stroke()
      break;
    default:
      break;
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
    updatePixels(chunk, pixels)

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
  for (const [coordinate, localChunks] of affectedChunks.entries()) {
    const [cx, cy] = coordinate.split(",")
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Undo]")

    for (const [index, change] of localChunks.entries()) {
      const pixel = change.before

      chunk.data[index] = pixel
      chunk.occupied[index] = change.beforeOccupied
    }

    let cacheView = state.view.chunkOrders.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk View Cache [Undo]")
    cacheView.dirty = true

  }
  redoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}

export function redo() {
  const affectedChunks = redoEntry.pop()
  if (!affectedChunks) return

  for (const [coordinate, localChunks] of affectedChunks.entries()) {
    const [cx, cy] = coordinate.split(",")
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Redo]")

    for (const [index, change] of localChunks.entries()) {
      const pixel = change.after

      chunk.data[index] = pixel
      chunk.occupied[index] = change.afterOccupied
    }

    const cacheView = state.view.chunkOrders.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk View Cache [Redo]")

    cacheView.dirty = true
  }
  undoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}

export function applyTool(state) {
  const { tool } = state.ui

  switch (tool) {
    case ToolState.BrushTool:
      const brush = document.querySelector("brush-tool")
      state.ui.brush.radius = brush.radius
      break;
    default:
      break;
  }
}
