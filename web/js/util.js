export function clamp(value, min, max) {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

export function insideBrush(worldX, worldY, x, y, rad) {
  const dx = worldX - x
  const dy = worldY - y
  return ((dx * dx) + (dy * dy)) <= (rad * rad)

}

export function getBrushSizeInWorld(worldCamera = { x, y }, radius) {
  const minX = worldCamera.x - radius
  const minY = worldCamera.y - radius

  const maxX = worldCamera.x + radius
  const maxY = worldCamera.y + radius

  const height = maxY - minY
  const width = maxX - minX

  return { minX, minY, maxX, maxY, height, width }
}
