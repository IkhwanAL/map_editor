import { mapGenerator, drawMap, requestRedraw } from "./canvas.js"
import { state } from "./state.js"
import { MouseEditorState, ToolState } from "./state_option.js"

document.addEventListener("drawMap", e => {
  let { generator } = state.world

  Object.assign(generator, e.detail)

  mapGenerator(generator)
  drawMap()
})

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
    requestRedraw({ overlay: true })
  } else {
    state.ui.mode = MouseEditorState.UsingTool
  }
}
