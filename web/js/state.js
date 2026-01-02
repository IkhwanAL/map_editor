import { sfc32 } from "./random.js"
import { NewPermutationTable } from "./noise.js"
import { MouseEditorState } from "./state_option.js"
/**
 * @type {HTMLCanvasElement}
 */
export const canvas = document.getElementById("canvas")

/**
 * @type {HTMLCanvasElement}
 */
export const overlay = document.getElementById("overlay")

export function newState() {
  let freshState = {
    version: 1,
    world: {
      seed1: null,
      seed2: null,
      seed3: null,
      seed4: null,
      permutationTable: [],
      generator: {
        octaves: null,
        persistence: null,
        lacunarity: null,
        frequency: null,
        amplitude: null
      },
      chunk: []
    },
    ui: {
      width: 0,
      height: 0,
      isDragging: false,
      space: false,
      mode: MouseEditorState.Idle,
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      camera: {
        x: 0,
        y: 0,
      },
      zoom: 1 // One Mean Original Position
    },
    view: {
      chunkOrders: [],
      dirty: false,
      map: [],
    },
  }

  const { perm, seed1, seed2, seed3, seed4 } = setupGenerator()

  freshState.world.permutationTable = perm;
  freshState.world.seed1 = seed1
  freshState.world.seed2 = seed2
  freshState.world.seed3 = seed3
  freshState.world.seed4 = seed4

  return freshState
}

export let state = newState()

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

export function setCanvasState(newState) {
  state.world = newState.world
  state.view = newState.view
}

