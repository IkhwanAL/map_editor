import { redo, undo } from "./draw.js"
import { renderRightSidebar } from "./sidebar.js"
import { state } from "./state.js"
import { MouseEditorState, ToolState } from "./state_option.js"
import { handleDebugLayer } from "./topbar.js"

window.addEventListener("keydown", ev => {
  ev.preventDefault()
  if (ev.code == "Space" && state.ui.mode == MouseEditorState.Idle) {
    state.ui.space = true
    state.ui.mode = MouseEditorState.Dragging
  }

  if (ev.code == "Escape") {
    state.ui.tool = ToolState.None
    renderRightSidebar()
  }

  const isCtrlOrCmd = ev.ctrlKey || ev.metaKey
  const isZKey = ev.key === "z"
  const isRKey = ev.key === "r"
  const isDKey = ev.key === "d"

  if (isCtrlOrCmd && isZKey) {
    undo()
  }

  if (isCtrlOrCmd && isRKey) {
    redo()
  }

  if (isCtrlOrCmd && isDKey) {
    handleDebugLayer()
  }
})

window.addEventListener("keyup", ev => {
  ev.preventDefault()
  if (ev.code == "Space" && state.ui.mode == MouseEditorState.Dragging) {
    state.ui.space = false
    state.ui.mode = MouseEditorState.Idle
  }
  return
})
