import { requestRedraw } from "./canvas.js"
import { canvasState, editorState, canvas } from "./state.js"
import { MouseEditorState } from "./state_option.js"

canvas.addEventListener("mouseup", () => editorState.isDragging = false)
canvas.addEventListener("mouseleave", () => editorState.isDragging = false)

canvas.addEventListener("mousedown", (ev) => {
  const canvasPosition = canvas.getBoundingClientRect()

  editorState.isDragging = true
  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
  editorState.x0 = (ev.clientX - canvasPosition.left) + canvasState.editorState.camera.x
  editorState.y0 = (ev.clientY - canvasPosition.top) + canvasState.editorState.camera.y
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
  if (!editorState.isDragging) return

  const canvasPosition = canvas.getBoundingClientRect()
  if (editorState.state == MouseEditorState.SelectDrag) {
    editorState.x1 = (ev.clientX - canvasPosition.left) + canvasState.editorState.camera.x
    editorState.y1 = (ev.clientY - canvasPosition.top) + canvasState.editorState.camera.y

    requestRedraw({ overlay: true, overlay: true })
    return
  }

  const deltaX = ev.clientX - canvasState.lastMouseX
  const deltaY = ev.clientY - canvasState.lastMouseY

  canvasState.editorState.camera.x += deltaX
  canvasState.editorState.camera.y += deltaY

  requestRedraw({ overlay: true, world: true })

  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

