import { state, canvas, overlay, tool, CHUNK_SIZE, undoEntry, redoEntry, debug } from "./state.js"
import { StrokeMode, ToolState } from "./state_option.js"
import { getWorldCoordinate, setCollisionPixel, updatePixels } from "./pixel.js"
import { getBrushSizeInWorld } from "./util.js"
import { debugCollisionColor, getColorRGB } from "./color.js"
import { storeChunk } from "./chunk.js"

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

const overlayCtx = overlay.getContext("2d")
overlayCtx.imageSmoothingEnabled = false

const debugCtx = debug.getContext("2d")
debugCtx.imageSmoothingEnabled = false

const toolCtx = tool.getContext("2d")
toolCtx.imageSmoothingEnabled = false

// Store Chunk In Preview Layer
function drawWorld() {
  // Reset Screen Canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  const tx = Math.round(-cam.x * zoom)
  const ty = Math.round(-cam.y * zoom)

  // Apply Camere Position
  ctx.setTransform(zoom, 0, 0, zoom, tx, ty)

  for (const [coordinate, chunk] of state.world.chunks.entries()) {
    const worldX = getWorldCoordinate(chunk.cx)
    const worldY = getWorldCoordinate(chunk.cy)

    // Use the Cache Does not need to compute
    let chunkView = state.view.terrainChunks.get(coordinate)
    if (chunkView && chunkView.dirty == false) {
      ctx.drawImage(chunkView.offscreen, worldX, worldY)
      continue
    }

    if (!chunkView) {
      const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
      chunkView = { offscreen, dirty: false }
      state.view.terrainChunks.set(coordinate, chunkView)
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
      const rad = state.ui[ToolState.BrushTool].radius
      toolCtx.beginPath()
      toolCtx.strokeStyle = "rgba(0,0,255, 1)"
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

function drawDebugLayer() {
  debugCtx.setTransform(1, 0, 0, 1, 0, 0)
  debugCtx.clearRect(0, 0, state.ui.width, state.ui.height)

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  debugCtx.translate(-cam.x * zoom, -cam.y * zoom)
  debugCtx.scale(zoom, zoom)

  for (const [key, { cvs }] of state.ui.previewCollisionChunks) {
    const [cx, cy] = key.split(",").map(Number)
    debugCtx.drawImage(cvs, getWorldCoordinate(cx), getWorldCoordinate(cy))
  }

  for (const [coordinate, chunk] of state.world.chunks.entries()) {
    const worldX = getWorldCoordinate(chunk.cx)
    const worldY = getWorldCoordinate(chunk.cy)

    // Use the Cache Does not need to compute
    let chunkView = state.view.collisionChunks.get(coordinate)
    if (chunkView && chunkView.dirty == false) {
      debugCtx.drawImage(chunkView.offscreen, worldX, worldY)
      continue
    }

    if (!chunkView) {
      const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
      chunkView = { offscreen, dirty: false }
      state.view.collisionChunks.set(coordinate, chunkView)
    }

    const offCtx = chunkView.offscreen.getContext("2d")
    offCtx.imageSmoothingEnabled = false

    const temp = structuredClone(offCtx.getImageData(0, 0, CHUNK_SIZE, CHUNK_SIZE))
    const imageData = offCtx.getImageData(0, 0, CHUNK_SIZE, CHUNK_SIZE)
    offCtx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE)

    setCollisionPixel(chunk, imageData.data)
    // console.log(temp.data, imageData.data)
    for (let index = 0; index < temp.data.length; index++) {
      const tem = temp.data[index];
      const ele = imageData.data[index];

      if (tem != ele) {
        console.warn("Not Same", tem, ele)
      }

      if (tem == ele) {
        console.log("Same", tem, ele)
      }
    }

    offCtx.putImageData(imageData, 0, 0)
    debugCtx.drawImage(chunkView.offscreen, worldX, worldY)

    chunkView.dirty = false
  }
}

export function clearDebugLayer() {
  debugCtx.setTransform(1, 0, 0, 1, 0, 0)
  debugCtx.clearRect(0, 0, state.ui.width, state.ui.height)
}

let redrawWorld = false
let redrawOverlay = false
let redrawTool = false
let redrawDebugLayer = false
let needsRedraw = false

export function requestRedraw({ world = false, overlay = false, tool = false, debug = false } = {}) {
  redrawWorld ||= world
  redrawOverlay ||= overlay
  redrawTool ||= tool
  redrawDebugLayer ||= debug

  if (!needsRedraw) {
    needsRedraw = true
    requestAnimationFrame(frame)
  }
}

function frame() {
  if (state.ui.strokeDirty) {
    stroke()
  }

  if (redrawWorld) drawWorld()
  if (redrawOverlay) drawOverlayPreview()
  if (redrawTool) drawTool()
  if (redrawDebugLayer) drawDebugLayer()

  redrawWorld = false
  redrawOverlay = false
  redrawTool = false
  redrawDebugLayer = false
  needsRedraw = false

  // console.log(state.world.chunks)
}

// TODO: Need to Come up a Better Function Name
function stroke() {
  const radius = state.ui[state.ui.tool].radius
  const { minX, minY, height, width } = getBrushSizeInWorld(state.world, radius)

  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      const worldX = Math.floor(minX + sx)
      const worldY = Math.floor(minY + sy)

      const dx = worldX - state.world.x
      const dy = worldY - state.world.y

      const insideCircle = ((dx * dx) + (dy * dy)) <= (radius * radius)

      if (!insideCircle) continue

      let value = 0
      let rgb = { r: 0, g: 0, b: 0, a: 0 }

      const mode = state.ui[state.ui.tool].mode
      if (mode == StrokeMode.Terrain) {
        value = state.ui[state.ui.tool].texture
        rgb = getColorRGB(value)
      } else {
        value = state.ui[state.ui.tool].collision
        rgb = debugCollisionColor
      }

      const color = `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`
      storeChunk(worldX, worldY, value, color, mode)
    }
  }
}

export function loadViewStateFromSavedState(newState) {
  const worldState = newState.world
  const terrainChunks = new Map()
  for (const chunk of worldState.chunks.values()) {
    const pixels = new Uint8ClampedArray(CHUNK_SIZE * CHUNK_SIZE * 4)
    updatePixels(chunk, pixels)

    const imageData = new ImageData(pixels, CHUNK_SIZE, CHUNK_SIZE)
    const offscreen = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
    const offCtx = offscreen.getContext("2d")

    offCtx.putImageData(imageData, 0, 0)

    const key = `${chunk.cx},${chunk.cy}`

    terrainChunks.set(key, {
      offscreen: offscreen,
      dirty: false
    })
  }

  state.view.terrainChunks = terrainChunks

  requestRedraw({ world: true })
}

export function undo() {
  const affectedChunks = undoEntry.pop()
  if (!affectedChunks) {
    return
  }
  for (const change of affectedChunks) {
    const { cx, cy, index } = change;
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Undo]")

    const pixel = change.before;
    chunk.terrain[index] = pixel.terrain
    chunk.occupied[index] = pixel.occupied

    let cacheView = state.view.terrainChunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk View Cache [Undo]")
    cacheView.dirty = true

  }
  redoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}

export function redo() {
  const affectedChunks = redoEntry.pop()
  if (!affectedChunks) return

  for (const change of affectedChunks) {
    const { cx, cy, index } = change
    const chunkKey = cx + "," + cy;
    const chunk = state.world.chunks.get(chunkKey)
    console.assert(chunk != null, "Something Wrong With Chunk Source of Truth [Redo]")

    const pixel = change.after

    chunk.terrain[index] = pixel.terrain
    chunk.occupied[index] = pixel.occupied

    const cacheView = state.view.terrainChunks.get(chunkKey)
    console.assert(cacheView != null, "Something Wrong With Chunk View Cache [Redo]")

    cacheView.dirty = true
  }
  undoEntry.push(affectedChunks)
  requestRedraw({ world: true })
}

