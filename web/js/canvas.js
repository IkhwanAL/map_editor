import { applyToolIndicator, requestRedraw } from "./draw.js";
import { getChunkCoordinate, getLocalChunkCoordinate, getWorldCoordinate } from "./pixel.js";
import { state, canvas, CHUNK_SIZE } from "./state.js";
import { MouseEditorState } from "./state_option.js";
import { clamp } from "./util.js";

canvas.addEventListener("mouseup", () => {
  state.ui.mode == MouseEditorState.Idle;
  state.ui.mouseDown = false;
  state.ui.strokeActive = false

  for (const [coordinate, preview] of state.ui.previewChunks) {
    const [cx, cy] = coordinate.split(",")

    let chunk = state.world.chunks.get(coordinate)
    if (!chunk) {
      const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
      const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
      chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
      state.world.chunks.set(coordinate, chunk)
    }

    const img = preview.ctx.getImageData(0, 0, CHUNK_SIZE, CHUNK_SIZE)
    const pixels = img.data

    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      const p = x * 4
      const value = pixels[p] / 255
      chunk.data[x] = value * 2 - 1
      chunk.occupied[x] = pixels[p + 3] ? 1 : 0
    }

    chunk.dirty = true
  }

  state.ui.previewChunks.clear()

  requestRedraw({ world: true, overlay: true })
})

canvas.addEventListener("wheel", (ev) => {
  ev.preventDefault()
  if (ev.deltaY < 0) {
    state.ui.zoomUnits += 4
  } else {
    state.ui.zoomUnits -= 4
  }

  state.ui.zoomUnits = clamp(state.ui.zoomUnits, 4, 128)
  state.ui.zoom = state.ui.zoomUnits / CHUNK_SIZE

  requestRedraw({ world: true })
})

function shouldHandleMouseMove() {
  if (state.ui.mode == MouseEditorState.Idle) return false
  return true
}

function panCamera(state, mouse) {
  const zoom = state.ui.zoom

  const deltaX = mouse.x - state.ui.lastMouseX
  const deltaY = mouse.y - state.ui.lastMouseY

  state.ui.camera.x -= deltaX / zoom
  state.ui.camera.y -= deltaY / zoom
}

function handleMovingMouse(state, mouse) {
  if (state.ui.mode == MouseEditorState.Dragging) {
    panCamera(state, mouse)
    requestRedraw({ world: true })
    return
  }

  if (state.ui.mode == MouseEditorState.UsingTool && state.ui.strokeActive) {
    state.ui.strokeDirty = true
    requestRedraw({ overlay: true })
  }
}

canvas.addEventListener("mousedown", (ev) => {
  if (state.ui.mode == MouseEditorState.Idle) return

  state.ui.preview = Object.create(null)

  const rect = canvas.getBoundingClientRect()
  state.ui.lastMouseX = ev.clientX - rect.left
  state.ui.lastMouseY = ev.clientY - rect.top

  state.ui.mouseDown = true

  if (state.ui.mode === MouseEditorState.UsingTool) {
    state.ui.strokeActive = true

    const brush = document.querySelector("brush-tool")
    const configMap = brush.shadowRoot.querySelector("draw-map-tool")
    const detail = {
      octaves: configMap.octaves,
      persistence: configMap.persistence,
      lacunarity: configMap.lacunarity,
      frequency: configMap.frequency
    }
    Object.assign(state.ui.strokeConfig.generatorConfig, detail)
  }
})

canvas.addEventListener("mousemove", (ev) => {
  if (!shouldHandleMouseMove()) {
    return
  }

  applyToolIndicator(state)

  const rect = canvas.getBoundingClientRect()

  const mouseX = ev.clientX - rect.left
  const mouseY = ev.clientY - rect.top

  if (state.ui.mouseDown) handleMovingMouse(state, { x: mouseX, y: mouseY })
  state.ui.lastMouseX = mouseX
  state.ui.lastMouseY = mouseY

  state.world.x = mouseX / state.ui.zoom + state.ui.camera.x
  state.world.y = mouseY / state.ui.zoom + state.ui.camera.y

  requestRedraw({ tool: true })
})
