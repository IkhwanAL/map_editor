export class Vec2 {
  /**
  * @param {Number} x
  * @param {Number} y 
  */
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

export function NewPermutationTable(rand) {
  const perm = new Array(256)

  for (let index = 0; index < 256; index++) {
    perm[index] = index
  }

  for (let index = 255; index > 0; index--) {
    const j = Math.floor(rand() * (index + 1))

    const temp = perm[index]
    perm[index] = perm[j]
    perm[j] = temp
  }

  return perm.concat(perm)
}

const INV_SQRT2 = 1 / Math.sqrt(2)

const GRADIENTS = [
  { x: INV_SQRT2, y: INV_SQRT2 },
  { x: -INV_SQRT2, y: INV_SQRT2 },
  { x: -INV_SQRT2, y: -INV_SQRT2 },
  { x: INV_SQRT2, y: -INV_SQRT2 },
]
function getGradient(x) {
  const v = x & 3

  switch (v) {
    case 0:
      return GRADIENTS[0]
    // return new Vec2(1.0, 1.0)
    case 1:
      return GRADIENTS[1]
    // return new Vec2(-1.0, 1.0)
    case 2:
      return GRADIENTS[2]
    // return new Vec2(-1.0, -1.0)
    default:
      return GRADIENTS[3]
    // return new Vec2(1.0, -1.0)
  }
}

export function perlinNoise(x, y, PERM) {
  const floorX = Math.floor(x)
  const floorY = Math.floor(y)

  const X = floorX & 255
  const Y = floorY & 255

  const xf = x - floorX
  const yf = y - floorY

  const topRightVecToPoint = new Vec2(xf - 1.0, yf - 1.0)
  const topLeftVecToPoint = new Vec2(xf, yf - 1.0)
  const bottomRightVecToPoint = new Vec2(xf - 1.0, yf)
  const bottomLeftVecToPoint = new Vec2(xf, yf)

  let loc

  loc = PERM[PERM[X + 1] + Y + 1]
  let topRightCornerDirection = getGradient(loc)

  loc = PERM[PERM[X] + Y + 1]
  let topLeftCornerDirection = getGradient(loc)

  loc = PERM[PERM[X] + Y]
  const bottomLeftCornerDirection = getGradient(loc)

  loc = PERM[PERM[X + 1] + Y]
  let bottomRightCornerDirection = getGradient(loc)

  const dotTopRight = dot(topRightVecToPoint, topRightCornerDirection)
  const dotTopLeft = dot(topLeftVecToPoint, topLeftCornerDirection)
  const dotBottomLeft = dot(bottomLeftVecToPoint, bottomLeftCornerDirection)
  const dotBottomRight = dot(bottomRightVecToPoint, bottomRightCornerDirection)

  const u = fade(xf)
  const v = fade(yf)

  const lerpTop = lerp(u, dotTopLeft, dotTopRight)
  const lerpBottom = lerp(u, dotBottomLeft, dotBottomRight)

  return lerp(v, lerpBottom, lerpTop)
}

export const defaultFractalOption = {
  octaves: 4,
  persistance: 0.5,
  lacunarity: 2.0,
}

export function FractalNoise(x, y, PERM, option = defaultFractalOption) {
  let total = 0.0;
  let frequency = 0.01
  let amplitude = 1.0

  let maxValue = 0.0

  const { lacunarity, octaves, persistance } = option

  for (let i = 0; i < octaves; i++) {
    const n = amplitude * perlinNoise(x * frequency, y * frequency, PERM)
    total += n
    maxValue += amplitude

    amplitude *= persistance
    frequency *= lacunarity
  }

  return total / maxValue
}

/**
  * @param {Vec2} vec1
  * @param {Vec2} vec2
  * 
  */
function dot(vec1, vec2) {
  return (vec1.x * vec2.x) + (vec1.y * vec2.y)
}

function fade(t) {
  return ((6 * t - 15) * t + 10) * t * t * t
}

/**
  * @param {number} t - Blend Factor
  * @param {number} leftValue - start of point value
  * @param {number} rightValue - end of point value
  *
  */
function lerp(t, leftValue, rightValue) {
  return leftValue + t * (rightValue - leftValue)
}
