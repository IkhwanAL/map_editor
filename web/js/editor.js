import { requestRedraw, undo } from "./canvas.js"
import { state, canvas, CHUNK_SIZE } from "./state.js"
import { MouseEditorState } from "./state_option.js"
import { clamp } from "./util.js"

window.addEventListener("keydown", ev => {
  if (ev.code == "Space") {
    state.ui.space = true
    state.ui.mode = MouseEditorState.Drag
    ev.preventDefault()
  }

  const isCtrlOrCmd = ev.ctrlKey || ev.metaKey
  const isZKey = ev.key === "z"
  const isRKey = ev.key === "r"

  if (isCtrlOrCmd && isZKey) {
    undo()
  }

  if (isCtrlOrCmd && isRKey) {
    // Redo
  }

  return
})

window.addEventListener("keyup", ev => {
  if (ev.code == "Space") {
    state.ui.space = false
    state.ui.mode = MouseEditorState.Idle
    ev.preventDefault()
  }
  return
})

canvas.addEventListener("mouseup", () => { state.ui.mode == MouseEditorState.Idle; state.ui.isDragging = false })
canvas.addEventListener("mouseleave", () => { state.ui.mode == MouseEditorState.Idle; state.ui.isDragging = false })

canvas.addEventListener("mousedown", (ev) => {
  if (state.ui.mode == MouseEditorState.Idle) return

  if (state.ui.mode == MouseEditorState.Drag) {
    if (!state.ui.space) {
      return
    }
  }

  const canvasPosition = canvas.getBoundingClientRect()

  const zoom = state.ui.zoom
  const cam = state.ui.camera

  state.ui.isDragging = true
  state.ui.lastMouseX = ev.clientX
  state.ui.lastMouseY = ev.clientY

  const canvasX = ev.clientX - canvasPosition.left
  const canvasY = ev.clientY - canvasPosition.top

  if (state.ui.mode == MouseEditorState.SelectDrag) {
    state.ui.x0 = canvasX / zoom + cam.x
    state.ui.y0 = canvasY / zoom + cam.y
  }

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

canvas.addEventListener("mousemove", (ev) => {
  if (state.ui.mode == MouseEditorState.Idle) return
  if (!state.ui.isDragging) return

  if (state.ui.mode == MouseEditorState.Drag) {
    if (!state.ui.space) {
      return
    }
  }

  const cam = state.ui.camera
  const zoom = state.ui.zoom

  const canvasPosition = canvas.getBoundingClientRect()
  if (state.ui.mode == MouseEditorState.SelectDrag) {

    const canvasX = ev.clientX - canvasPosition.left
    const canvasY = ev.clientY - canvasPosition.top

    state.ui.x1 = canvasX / zoom + cam.x
    state.ui.y1 = canvasY / zoom + cam.y

    requestRedraw({ overlay: true })
    return
  }

  const deltaX = ev.clientX - state.ui.lastMouseX
  const deltaY = ev.clientY - state.ui.lastMouseY

  state.ui.camera.x -= deltaX / zoom
  state.ui.camera.y -= deltaY / zoom

  requestRedraw({ overlay: true, world: true })

  state.ui.lastMouseX = ev.clientX
  state.ui.lastMouseY = ev.clientY
})

