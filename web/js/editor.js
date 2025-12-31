import { requestRedraw } from "./canvas.js"
import { canvasState, editorState, canvas } from "./state.js"
import { MouseEditorState } from "./state_option.js"

window.addEventListener("keydown", ev => {
  if (ev.code == "Space") {
    editorState.space = true
    editorState.mode = MouseEditorState.Drag
    ev.preventDefault()
  }
  return
})

window.addEventListener("keyup", ev => {
  if (ev.code == "Space") {
    editorState.space = false
    editorState.mode = MouseEditorState.Idle
    ev.preventDefault()
  }
  return
})

canvas.addEventListener("mouseup", () => { editorState.mode == MouseEditorState.Idle; editorState.isDragging = false })
canvas.addEventListener("mouseleave", () => { editorState.mode == MouseEditorState.Idle; editorState.isDragging = false })

canvas.addEventListener("mousedown", (ev) => {
  if (editorState.mode == MouseEditorState.Idle) return

  if (editorState.mode == MouseEditorState.Drag) {
    if (!editorState.space) {
      return
    }
  }

  const canvasPosition = canvas.getBoundingClientRect()

  const zoom = canvasState.editorState.zoom
  const cam = canvasState.editorState.camera

  editorState.isDragging = true
  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY

  const canvasX = ev.clientX - canvasPosition.left
  const canvasY = ev.clientY - canvasPosition.top

  editorState.x0 = canvasX / zoom + cam.x
  editorState.y0 = canvasY / zoom + cam.y
})

canvas.addEventListener("wheel", (ev) => {
  if (ev.deltaY < 0) {
    canvasState.editorState.zoom *= 1.1
  } else {
    canvasState.editorState.zoom /= 1.1
  }

  requestRedraw({ world: true, overlay: true })
})

canvas.addEventListener("mousemove", (ev) => {
  if (editorState.mode == MouseEditorState.Idle) return
  if (!editorState.isDragging) return

  if (editorState.mode == MouseEditorState.Drag) {
    if (!editorState.space) {
      return
    }
  }

  const cam = canvasState.editorState.camera
  const zoom = canvasState.editorState.zoom

  const canvasPosition = canvas.getBoundingClientRect()
  if (editorState.mode == MouseEditorState.SelectDrag) {

    const canvasX = ev.clientX - canvasPosition.left
    const canvasY = ev.clientY - canvasPosition.top

    editorState.x1 = canvasX / zoom + cam.x
    editorState.y1 = canvasY / zoom + cam.y

    requestRedraw({ overlay: true })
    return
  }

  const deltaX = ev.clientX - canvasState.lastMouseX
  const deltaY = ev.clientY - canvasState.lastMouseY

  canvasState.editorState.camera.x -= deltaX
  canvasState.editorState.camera.y -= deltaY

  requestRedraw({ overlay: true, world: true })

  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

