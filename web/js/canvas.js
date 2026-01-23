import { applyToolIndicator, requestRedraw } from "./draw.js";
import { getChunkCoordinate, getLocalChunkCoordinate, getWorldCoordinate } from "./pixel.js";
import { state, canvas, CHUNK_SIZE, undoEntry, clearRedo } from "./state.js";
import { MouseEditorState } from "./state_option.js";
import { clamp } from "./util.js";

canvas.addEventListener("mouseup", () => {
  state.ui.mode == MouseEditorState.Idle;
  state.ui.mouseDown = false;
  state.ui.strokeActive = false

  const affectedChunks = new Map()

  for (const [coordinate, commit] of state.ui.toCommitChunk) {
    const { cx, cy } = commit
    let viewChunk = state.view.chunkOrders.get(coordinate)
    if (viewChunk) {
      viewChunk.dirty = true
    }

    let chunk = state.world.chunks.get(coordinate)
    if (!chunk) {
      const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(-1)
      const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
      chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
      state.world.chunks.set(coordinate, chunk)
    }

    const undoChunks = new Map()

    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      if (commit.occupied[x] === 0) continue

      const prevValue = chunk.data[x]
      const prevOccupied = chunk.occupied[x]

      let newValue = commit.data[x]
      const newOccupied = 1

      if (prevValue !== newValue || prevOccupied !== newOccupied) {
        undoChunks.set(x, {
          before: { data: prevValue, occupied: prevOccupied },
          after: { data: newValue, occupied: newOccupied }
        })
      }

      chunk.data[x] = newValue
      chunk.occupied[x] = newOccupied
    }

    if (undoChunks.size > 0) {
      affectedChunks.set(coordinate, undoChunks)
      chunk.dirty = true
    }

  }

  if (affectedChunks.size > 0) {
    undoEntry.push(affectedChunks)
    clearRedo()
  }

  state.ui.previewChunks.clear()
  state.ui.toCommitChunk.clear()

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
