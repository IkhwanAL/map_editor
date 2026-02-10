import { state, canvas, overlay, tool, CHUNK_SIZE, undoEntry, redoEntry } from "./state.js"
import { FractalNoise } from "./noise.js"
import { ToolState } from "./state_option.js"
import { getChunkCoordinate, getLocalChunkCoordinate, getWorldCoordinate, updatePixels } from "./pixel.js"
import { clamp } from "./util.js"

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

const overlayCtx = overlay.getContext("2d")
const toolCtx = tool.getContext("2d")

function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()
  state.ui.width = Math.ceil(editorRect.width)
  state.ui.height = Math.ceil(editorRect.height)

  canvas.width = state.ui.width
  canvas.height = state.ui.height

  overlay.width = state.ui.width
  overlay.height = state.ui.height

  tool.width = state.ui.width
  tool.height = state.ui.height

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, state.ui.width, state.ui.height)
}

getActualCanvasSize()

export function computeMap(option) {
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
      storeChunk(worldX, worldY, noise)
    }
  }

  return
}

function storeChunk(worldX, worldY, noise) {
  const cx = getChunkCoordinate(worldX)
  const cy = getChunkCoordinate(worldY)
  const key = cx + "," + cy

  let viewChunk = state.ui.previewChunks.get(key)
  if (!viewChunk) {
    const cvs = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
    const ctx = cvs.getContext("2d")
    ctx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE)

    viewChunk = { cvs, ctx }
    state.ui.previewChunks.set(key, viewChunk)
  }

  const localX = getLocalChunkCoordinate(worldX, cx)
  const localY = getLocalChunkCoordinate(worldY, cy)

  const v = clamp(((noise + 1) * 127.5) | 0, 0, 255)

  viewChunk.ctx.fillStyle = `rgb(${v},${v},${v})`
  viewChunk.ctx.fillRect(localX, localY, 1, 1)

  let chunk = state.ui.userCommand.snapshot.get(key)
  if (!chunk) {
    chunk = {
      cx, cy,
      data: new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(-1),
      occupied: new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    }
    state.ui.userCommand.snapshot.set(key, chunk)
  }

  const i = localY * CHUNK_SIZE + localX

  chunk.data[i] = noise;
  chunk.occupied[i] = 1
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

function drawTool() {
  toolCtx.setTransform(1, 0, 0, 1, 0, 0)
  toolCtx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  toolCtx.translate(-cam.x * zoom, -cam.y * zoom)
  toolCtx.scale(zoom, zoom)

  switch (state.ui.tool) {
    case ToolState.BrushTool:
      const rad = state.ui.brush.radius
      toolCtx.beginPath()
      toolCtx.strokeStyle = "rgba(0,0,255, 0.6)"
      toolCtx.arc(state.world.x, state.world.y, rad, 0, Math.PI * 2, false)
      toolCtx.stroke()
      break;
    default:
      break;
  }

}

function drawOverlayPreview() {
  overlayCtx.setTransform(1, 0, 0, 1, 0, 0)
  overlayCtx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  overlayCtx.translate(-cam.x * zoom, -cam.y * zoom)
  overlayCtx.scale(zoom, zoom)

  for (const [key, { cvs }] of state.ui.previewChunks) {
    const [cx, cy] = key.split(",").map(Number)
    overlayCtx.drawImage(cvs, getWorldCoordinate(cx), getWorldCoordinate(cy))
  }
}

let redrawWorld = false
let redrawOverlay = false
let redrawTool = false
let needsRedraw = false

export function requestRedraw({ world = false, overlay = false, tool = false } = {}) {
  redrawWorld ||= world
  redrawOverlay ||= overlay
  redrawTool ||= tool

  if (!needsRedraw) {
    needsRedraw = true
    requestAnimationFrame(frame)
  }
}

function frame() {
  if (state.ui.strokeDirty) {
    computeMap(state.ui.strokeConfig.generatorConfig)
    state.ui.strokeDirty = false;
    redrawOverlay = true
  }

  if (redrawWorld) drawWorld()
  if (redrawOverlay) drawOverlayPreview()
  if (redrawTool) drawTool()

  redrawWorld = false
  redrawOverlay = false
  redrawTool = false
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
  for (const change of affectedChunks) {
    const { cx, cy, x } = change;
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Undo]")

    const pixel = change.before;
    chunk.data[x] = pixel.data
    chunk.occupied[x] = pixel.occupied

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

  for (const change of affectedChunks.entries()) {
    const { cx, cy, x } = change
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Redo]")

    const pixel = change.after

    chunk.data[x] = pixel.data
    chunk.occupied[x] = pixel.occupied

    const cacheView = state.view.chunkOrders.get(chunkKey)
    console.assert(cacheView != null, "Something Wrong With Chunk View Cache [Redo]")

    cacheView.dirty = true
  }
  undoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}

export function applyToolIndicator(state) {
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
