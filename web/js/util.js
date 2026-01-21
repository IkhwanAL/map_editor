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
