import { requestRedraw } from "./draw.js"
import { getActualCanvasSize, state } from "./state.js"
import { MouseEditorState, ToolState } from "./state_option.js"

const emptyRightSide = document.getElementById("empty-side")

document.getElementById("toolbar").addEventListener("click", (e) => {
  e.preventDefault()

  let tool = e.target.dataset.tool;
  if (!tool || tool == state.ui.tool) {
    tool = ToolState.None
  }

  state.ui.tool = tool
  renderRightSidebar()
})

let activeChild = null

export function renderRightSidebar() {

  if (state.ui.tool === ToolState.None) {
    state.ui.mode = MouseEditorState.Idle
    emptyRightSide.removeChild(activeChild)
    requestRedraw({ tool: true })
  } else {
    state.ui.mode = MouseEditorState.UsingTool
    placeConfigurationInRightbar(state.ui.tool)
  }

}

function placeConfigurationInRightbar(elementName) {
  activeChild = document.createElement(elementName)
  activeChild.id = elementName
  emptyRightSide.appendChild(activeChild)
}
