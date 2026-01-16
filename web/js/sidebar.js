import { mapGenerator, drawMap } from "./canvas.js"
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
  "rectangle": document.getElementById("rectangle-tool"),
  "brush": document.getElementById("brush-tool")
}

function render() {
  for (const [name, el] of Object.entries(tools)) {
    el.hidden = state.ui.tool !== name
  }

  if (state.ui.tool === ToolState.None) {
    state.ui.mode = MouseEditorState.Idle
  } else {
    state.ui.mode = MouseEditorState.Drawing
  }

  console.log(state.ui.mode, state.ui.tool)
}
