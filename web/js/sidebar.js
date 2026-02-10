import { requestRedraw } from "./draw.js"
import { state } from "./state.js"
import { MouseEditorState, ToolState } from "./state_option.js"

const emptyRightSide = document.getElementById("empty-side")

document.getElementById("toolbar").addEventListener("click", (e) => {
  e.preventDefault()

  let tool = e.target.dataset.tool;
  if (!tool || tool == state.ui.tool) {
    tool = ToolState.None
  }

  state.ui.tool = tool
  render()
})

const tools = {
  "brush-tool": document.getElementById("brush-tool")
}

let activeChild = null

function render() {
  for (const [name, el] of Object.entries(tools)) {
    const idButton = el.dataset.button
    const elButton = document.getElementById(idButton)

    if (state.ui.tool == name) {
      el.hidden = false
      elButton.style.border = "2px solid blue"
    } else {
      el.hidden = true
      elButton.style.border = "2px solid black"
    }
  }

  if (state.ui.tool === ToolState.None) {
    state.ui.mode = MouseEditorState.Idle
    emptyRightSide.removeChild(activeChild)
    requestRedraw({ tool: true })
  } else {
    state.ui.mode = MouseEditorState.UsingTool
    placeConfigurationInRightbar()
  }
}

function placeConfigurationInRightbar() {
  activeChild = document.createElement("draw-map-tool")
  activeChild.id = "draw-map-tool"
  emptyRightSide.appendChild(activeChild)
}
