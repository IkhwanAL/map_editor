import { applyTool, redo, requestRedraw, undo } from "./canvas.js"
import { state, canvas, CHUNK_SIZE } from "./state.js"
import { MouseEditorState } from "./state_option.js"
import { clamp } from "./util.js"

window.addEventListener("keydown", ev => {
  ev.preventDefault()
  if (ev.code == "Space" && state.ui.mode == MouseEditorState.Idle) {
    state.ui.space = true
    state.ui.mode = MouseEditorState.Dragging
  }

  const isCtrlOrCmd = ev.ctrlKey || ev.metaKey
  const isZKey = ev.key === "z"
  const isRKey = ev.key === "r"

  if (isCtrlOrCmd && isZKey) {
    undo()
  }

  if (isCtrlOrCmd && isRKey) {
    redo()
  }

  return
})

window.addEventListener("keyup", ev => {
  ev.preventDefault()
  if (ev.code == "Space" && state.ui.mode == MouseEditorState.Dragging) {
    state.ui.space = false
    state.ui.mode = MouseEditorState.Idle
  }
  return
})

canvas.addEventListener("mouseup", () => {
  state.ui.mode == MouseEditorState.Idle;
  state.ui.mouseDown = false;
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

  requestRedraw({ world: true, overlay: true })
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

function draw() {
  const brush = document.querySelector("brush-tool")
  const configMap = brush.shadowRoot.querySelector("draw-map-tool")
  const detail = {
    octaves: configMap.octaves,
    persistence: configMap.persistence,
    lacunarity: configMap.lacunarity,
    frequency: configMap.frequency
  }
  document.dispatchEvent(new CustomEvent("drawMap", {
    detail,
    composed: true,
    bubbles: true
  }))
}

function handleMovingMouse(state, mouse) {
  if (state.ui.mode == MouseEditorState.Dragging) {
    panCamera(state, mouse)
    requestRedraw({ world: true })
    return
  }

  if (state.ui.mode == MouseEditorState.UsingTool) {
    draw()
  }
}

canvas.addEventListener("mousedown", (ev) => {
  if (state.ui.mode == MouseEditorState.Idle) return

  const rect = canvas.getBoundingClientRect()
  state.ui.lastMouseX = ev.clientX - rect.left
  state.ui.lastMouseY = ev.clientY - rect.top

  state.ui.mouseDown = true
})

canvas.addEventListener("mousemove", (ev) => {
  if (!shouldHandleMouseMove()) {
    return
  }

  const rect = canvas.getBoundingClientRect()

  // Since clientX and clientY is read full screen include sidebar
  // we need to exclude the sidebar from the position x,y
  const mouseX = ev.clientX - rect.left
  const mouseY = ev.clientY - rect.top

  if (state.ui.mode == MouseEditorState.UsingTool) {
    applyTool(state)
    requestRedraw({ overlay: true })
  }

  if (state.ui.mouseDown) handleMovingMouse(state, { x: mouseX, y: mouseY })

  state.ui.lastMouseX = mouseX
  state.ui.lastMouseY = mouseY

  state.world.x = mouseX / state.ui.zoom + state.ui.camera.x
  state.world.y = mouseY / state.ui.zoom + state.ui.camera.y

  requestRedraw({ overlay: true })
})

