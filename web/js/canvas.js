import { applyCommand, applyUndoRedoEffect, createCommand, parseCommand } from "./command.js";
import { applyToolIndicator, requestRedraw } from "./draw.js";
import { state, canvas, CHUNK_SIZE, undoEntry, clearRedo } from "./state.js";
import { MouseEditorState } from "./state_option.js";
import { clamp } from "./util.js";

canvas.addEventListener("mouseup", () => {
  if (!state.ui.strokeActive) return

  state.ui.mouseDown = false;
  state.ui.strokeActive = false;

  const cmd = parseCommand(state.world, state.ui.userCommand);
  applyCommand(state.world, state.view, cmd.affectedChunk)

  const undoEffect = applyUndoRedoEffect(cmd.undoRedoInfo)

  if (undoEffect.length > 0) {
    undoEntry.push(undoEffect)
    clearRedo()
  }

  state.ui.userCommand = createCommand(state.ui.tool, Date.now())
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

    const configMap = document.querySelector("draw-map-tool")
    const detail = {
      octaves: configMap.octaves,
      persistence: configMap.persistence,
      lacunarity: configMap.lacunarity,
      frequency: configMap.frequency
    }
    Object.assign(state.ui.strokeConfig.generatorConfig, detail)

    state.ui.userCommand = createCommand(state.ui.tool, Date.now())
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
