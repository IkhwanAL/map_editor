import { ToolState } from "./state_option.js";

export function applyToolIndicator(state) {
  const { tool } = state.ui

  switch (tool) {
    case ToolState.BrushTool:
      const brush = document.querySelector("brush-tool")
      state.ui["brush-tool"].radius = brush.radius
      break;
    default:
      break;
  }
}
