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

export const CHUNK_SIZE = 16

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
      chunks: new Map()
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
      chunkOrders: new Map(),
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

export function setWorldState(worldState) {
  state.world = worldState
}

export function saveState(stateWorld) {
  const newChunk = {}

  for (const [key, chunk] of stateWorld.chunks.entries()) {
    const data = Array.from(chunk.data)
    const occupied = Array.from(chunk.occupied)
    newChunk[key] = {
      data,
      occupied
    }
  }

  const toSavedState = {
    version: 1,
    seed: {
      1: stateWorld.seed1,
      2: stateWorld.seed2,
      3: stateWorld.seed3,
      4: stateWorld.seed4
    },
    mapGenerator: {
      octaves: stateWorld.generator.octaves,
      persistence: stateWorld.generator.persistence,
      lacunarity: stateWorld.generator.lacunarity,
      frequency: stateWorld.generator.frequency,
      amplitude: stateWorld.generator.amplitude,
    },
    world: { chunks: newChunk }
  }

  return toSavedState
}

export function reformSavedState(newState) {
  const chunks = new Map()

  for (const [cxcy, chunk] of Object.entries(newState.world.chunks)) {
    const coordinates = cxcy.split(",")

    const stateChunk = {
      cx: coordinates[0],
      cy: coordinates[1],
      data: new Float32Array(chunk.data),
      occupied: new Uint8Array(chunk.occupied),
      dirty: false
    }

    chunks.set(cxcy, stateChunk)
  }

  const rand = sfc32(newState.seed["1"], newState.seed["2"], newState.seed["3"], newState.seed["4"])

  const perm = NewPermutationTable(rand)

  const worldState = {
    seed1: newState.seed["1"],
    seed2: newState.seed["2"],
    seed3: newState.seed["3"],
    seed4: newState.seed["4"],
    generator: newState.mapGenerator,
    permutationTable: perm,
    chunks: chunks
  }

  return worldState
}
