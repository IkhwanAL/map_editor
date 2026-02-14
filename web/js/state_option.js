export const EmptyTile = 0
export const NoCollision = 0

export const MouseEditorState = Object.freeze({
  Idle: "idle",
  Dragging: "dragging",
  UsingTool: "using-tool"
})

export const ToolState = Object.freeze({
  None: null,
  BrushTool: "brush-tool"
})

export const StrokeMode = Object.freeze({
  Terrain: "terrain",
  Collision: "collision"
})

export const TextureOption = Object.freeze({
  void: 0,
  grass: 1,
  dirt: 2,
  cliff: 3
})

export const ColorHex = Object.freeze({
  Grass: "#41980a",
  Dirt: "#b69f66",
  Void: "#000000"
})

export const ColorRGB = Object.freeze({
  Grass: { r: 65, g: 152, b: 10, a: 1 },
  Dirt: { r: 182, g: 159, b: 102, a: 1 },
  Void: { r: 0, g: 0, b: 0, a: 1 },
})
