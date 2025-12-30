import { sfc32 } from "./random.js"
import { NewPermutationTable } from "./noise.js"
/**
 * @type {HTMLCanvasElement}
 */
export const canvas = document.getElementById("canvas")

/**
 * @type {HTMLCanvasElement}
 */
export const overlay = document.getElementById("overlay")

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
  lastMouseY: 0,
  chunkOrders: [],
  chunkAccess: {},
  editorState: {
    camera: {
      x: 0,
      y: 0,
    },
    zoom: 1 // One Mean Original Position
  }
}

// This is A State Of Mouse Or Editor To Keep Track What's Going On
// We Wont Store This Or Export This
export let editorState = {
  isDragging: false,
  state: "dragging",
  // Mouse Position
  x0: 0, // Need To Validate Does This Need to be Store in Canvas State
  y0: 0,
  x1: 0,
  y1: 0,
}

export function freshNewState() {
  const chunk = new Map()
  const state = structuredClone(defaultState)
  return { ...state, chunkAccess: chunk }
}

export function newState() {

  const { perm, seed1, seed2, seed3, seed4 } = setupGenerator()

  let state = structuredClone(defaultState)

  const chunk = new Map()

  return { ...state, permutationTable: perm, seed1, seed2, seed3, seed4, chunkAccess: chunk }
}

export let canvasState = newState()

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

