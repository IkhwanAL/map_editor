import { sfc32 } from "./random.js"
import { NewPermutationTable } from "./noise.js"

const defaultState = {
  version: 1,
  seed1: null,
  seed2: null,
  seed3: null,
  seed4: null,
  width: 0,
  height: 0,
  map: [],
  permutationTable: [],
  generator: {
    octaves: null,
    persistence: null,
    lacunarity: null,
    frequency: null,
    amplitude: null
  },
  dirty: false,
  lastMouseX: 0,
  lastMouseY: 0
}

/**
 * @param {number} width
 * @param {number} height
 * @param {CanvasRenderingContext2D} ctx
 *
 */
export function newState(width, height) {

  const { perm, seed1, seed2, seed3, seed4 } = setupGenerator()

  let state = structuredClone(defaultState)

  return { ...state, width, height, permutationTable: perm, seed1, seed2, seed3, seed4 }
}

export let canvasState = newState(100, 100)

export function setupGenerator() {
  const genSeed = () => (Math.random() * 2 ** 32) >> 0

  const seed1 = genSeed()
  const seed2 = genSeed()
  const seed3 = genSeed()
  const seed4 = genSeed()

  const rand = sfc32(seed1, seed2, seed3, seed4)

  const perm = NewPermutationTable(rand)

  return {
    seed1,
    seed2,
    seed3,
    seed4,
    perm
  }
}

export function setCanvasState(state) {
  canvasState = state
}
