export function bilinearInterpolation(map, dx, dy) {

  const maxX = map[0].length
  const maxY = map.length

  const sx = maxX / dx
  const sy = maxY / dy

  let newMap = new Array(dy)
  for (let y = 0; y < dy; y++) {
    newMap[y] = new Array(dx)
    for (let x = 0; x < dx; x++) {
      let originalX = x * sx
      let originalY = y * sy

      let x1 = Math.floor(originalX)
      let y1 = Math.floor(originalY)

      let x2 = Math.min(maxX - 1, x1 + 1)
      let y2 = Math.min(maxY - 1, y1 + 1)

      const horizontalDistance = (originalX - x1) / (x2 - x1)
      const verticalDistance = (originalY - y1) / (y2 - y1)

      const finalValue = calculateDistibution(horizontalDistance, verticalDistance, x1, x2, y1, y2, map)

      newMap[y][x] = finalValue
    }
  }

  return newMap
}

function calculateDistibution(dx, dy, x1, x2, y1, y2, map) {
  const topLeft = map[y1][x1] * ((1 - dx) * (1 - dy))
  const topRight = map[y1][x2] * ((dx) * (1 - dy))
  const bottomLeft = map[y2][x1] * ((1 - dx) * (dy))
  const bottomRight = map[y2][x2] * (dx * dy)

  return topLeft + topRight + bottomLeft + bottomRight
}
