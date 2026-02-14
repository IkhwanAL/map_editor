import { storeChunk } from "./draw.js"
import { state } from "./state.js"
import { getBrushSizeInWorld } from "./util.js"

export function computeMap(option) {
  const { permutationTable } = state.world

  const { minX, minY, height, width } = getBrushSizeInWorld(state.world, state.ui["brush-tool"].radius)

  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      const worldX = Math.floor(minX + sx)
      const worldY = Math.floor(minY + sy)

      const dx = worldX - state.world.x
      const dy = worldY - state.world.y

      const insideCircle = ((dx * dx) + (dy * dy)) <= (state.ui.brush.radius * state.ui.brush.radius)

      if (!insideCircle) continue

      const noise = FractalNoise(worldX, worldY, permutationTable, option)

      const v = clamp(((noise + 1) * 127.5) | 0, 0, 255)
      const rgb = `rgb(${v},${v},${v})`

      storeChunk(worldX, worldY, noise, rgb)
    }
  }

  return
}
