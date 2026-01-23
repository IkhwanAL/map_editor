import { redo, undo } from "./draw.js"
import { state } from "./state.js"
import { MouseEditorState } from "./state_option.js"

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
