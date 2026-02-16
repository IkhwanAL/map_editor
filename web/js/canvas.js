import { applyCommand, applyUndoRedoEffect, createCommand, parseCommand } from "./command.js";
import { requestRedraw } from "./draw.js";
import { state, canvas, CHUNK_SIZE, undoEntry, clearRedo } from "./state.js";
import { MouseEditorState, TextureOption } from "./state_option.js";
import { applyToolIndicator } from "./tool.js";
import { clamp } from "./util.js";
import { getMousePositionInCanvas } from "./device/mouse.js"

tool.addEventListener("mouseup", () => {
  state.ui.mouseDown = false;

  if (!state.ui.strokeActive) return
  state.ui.strokeActive = false;
  state.ui.strokeDirty = false

  const cmd = parseCommand(state.world, state.ui.userCommand);
  applyCommand(state.world, state.view, state.ui.userCommand.mode, cmd.affectedChunk)

  const undoEffect = applyUndoRedoEffect(cmd.undoRedoInfo)
  if (undoEffect.length > 0) {
    undoEntry.push(undoEffect)
    clearRedo()
  }

  state.ui.userCommand = createCommand(state.ui.tool, Date.now(), state.ui.userCommand.mode)
  state.ui.previewChunks.clear()
  state.ui.previewCollisionChunks.clear()

  requestRedraw({ world: true, overlay: true, debug: state.ui.showDebugLayer })

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

tool.addEventListener("mousedown", (ev) => {
  if (state.ui.mode == MouseEditorState.Idle) return

  state.ui.preview = Object.create(null)

  const { mouseX, mouseY } = getMousePositionInCanvas(canvas, ev.clientX, ev.clientY)

  state.ui.lastMouseX = mouseX
  state.ui.lastMouseY = mouseY

  state.ui.mouseDown = true

  if (state.ui.mode === MouseEditorState.UsingTool) {
    state.ui.strokeActive = true

    const option = document.querySelector(state.ui.tool)

    const config = {
      mode: option.mode,
      collision: option.collision,
      texture: TextureOption[option.texture] ?? TextureOption.void
    }

    state.ui[state.ui.tool] = {
      ...state.ui[state.ui.tool],
      ...config
    }
    state.ui.userCommand = createCommand(state.ui.tool, Date.now(), option.mode)
  }
})

tool.addEventListener("mousemove", (ev) => {
  if (!shouldHandleMouseMove()) {
    return
  }
  applyToolIndicator(state)

  const { mouseX, mouseY } = getMousePositionInCanvas(canvas, ev.clientX, ev.clientY)

  if (state.ui.mouseDown) handleMovingMouse(state, { x: mouseX, y: mouseY })
  state.ui.lastMouseX = mouseX
  state.ui.lastMouseY = mouseY

  state.world.x = mouseX / state.ui.zoom + state.ui.camera.x
  state.world.y = mouseY / state.ui.zoom + state.ui.camera.y

  requestRedraw({ tool: true, debug: state.ui.showDebugLayer })
})
