import { requestRedraw } from "./canvas.js"
import { canvasState, editorState, canvas } from "./state.js"

canvas.addEventListener("mouseup", () => editorState.isDragging = false)
canvas.addEventListener("mouseleave", () => editorState.isDragging = false)

canvas.addEventListener("mousedown", (ev) => {
  const canvasPosition = canvas.getBoundingClientRect()

  editorState.isDragging = true
  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
  editorState.x0 = (ev.clientX - canvasPosition.left) + editorState.camera.x
  editorState.y0 = (ev.clientY - canvasPosition.top) + editorState.camera.y
})

canvas.addEventListener("mousemove", (ev) => {
  if (!editorState.isDragging) return

  const canvasPosition = canvas.getBoundingClientRect()
  if (editorState.state == "press-drag") {
    editorState.x1 = (ev.clientX - canvasPosition.left) + editorState.camera.x
    editorState.y1 = (ev.clientY - canvasPosition.top) + editorState.camera.y

    requestRedraw({ overlay: true })
    return
  }

  console.log("1", canvasState.chunkOrder)
  const deltaX = ev.clientX - canvasState.lastMouseX
  const deltaY = ev.clientY - canvasState.lastMouseY

  editorState.camera.x -= deltaX
  editorState.camera.y -= deltaY

  requestRedraw({ overlay: true, world: true })

  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY

  console.log("2", canvasState.chunkOrder)
})

