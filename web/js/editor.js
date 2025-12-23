import { canvasState } from "./state.js"

let editorState = {
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
  state: "dragging",
  width: 0,
  height: 0
}

document.getElementById("press-drag").addEventListener("click", _ => {
  if (editorState.state == "press-drag") {
    editorState.state = "press-drag"
  } else {
    editorState.state = "dragging"
  }
})

canvas.addEventListener("mouseup", () => editorState.isDragging = false)
canvas.addEventListener("mouseleave", () => editorState.isDragging = false)

canvas.addEventListener("mousedown", (ev) => {
  editorState.isDragging = true
  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

canvas.addEventListener("mousemove", (ev) => {
  if (!editorState.isDragging) return

  if (editorState.state == "press-drag") {
    editorState.width = Math.abs(ev.clientX - canvasState.lastMouseX)
    editorState.height = Math.abs(v.clientY - canvasState.lastMouseY)
    return
  }

  const deltaX = ev.clientX - canvasState.lastMouseX
  const deltaY = ev.clientY - canvasState.lastMouseY

  editorState.offsetX += deltaX
  editorState.offsetY += deltaY

  window.dispatchEvent(new Event("request-redraw"))

  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

