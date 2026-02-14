import { sfc32 } from "./random.js"
import { NewPermutationTable } from "./noise.js"
import { MouseEditorState } from "./state_option.js"
/**
 * @type {HTMLCanvasElement}
 */
export const canvas = document.getElementById("base")

/**
 * @type {HTMLCanvasElement}
 */
export const overlay = document.getElementById("overlay")

/**
 * @type {HTMLCanvasElement}
 */
export const tool = document.getElementById("tool")

/**
 * @type {HTMLCanvasElement}
 */
export const debug = document.getElementById("debug")

export const CHUNK_SIZE = 16

export function newState() {
  let freshState = {
    version: 1,

    // This is The Source Of Truth 
    // Don't Get mIxed
    world: {
      seed1: null,
      seed2: null,
      seed3: null,
      seed4: null,
      x: 0,
      y: 0,
      permutationTable: [],
      chunks: new Map(),
    },
    // This is Ui Control
    ui: {
      previewChunks: new Map(),
      previewCollisionChunks: new Map(),
      width: 0,
      height: 0,
      space: false,
      mode: MouseEditorState.Idle,
      lastMouseX: 0,
      lastMouseY: 0,
      camera: {
        x: 0,
        y: 0,
      },
      zoom: 1,
      zoomUnits: CHUNK_SIZE,
      undoCmd: [],
      redoCmd: [],
      tool: null,
      mouseDown: false,
      strokeActive: false,
      strokeDirty: false,
      "brush-tool": {},
      preview: [],
      userCommand: {
        type: "",
        timestamp: 0,
        snapshot: new Map()
      },
      showDebugLayer: false
    },
    // this is just cache, it disposable
    view: {
      terrainChunks: new Map(),
      collisionChunks: new Map(),
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
export let undoEntry = []
export let redoEntry = []

export function clearRedo() {
  redoEntry = []
}

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
    const data = Array.from(chunk.terrain)
    const occupied = Array.from(chunk.occupied)
    newChunk[key] = {
      terrain: data,
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
      terrain: new Uint8Array(chunk.terrain),
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
    permutationTable: perm,
    chunks: chunks
  }

  return worldState
}

const editor = document.getElementById("editor")

export function getActualCanvasSize() {
  const dpr = window.devicePixelRatio || 1
  const editorRect = editor.getBoundingClientRect()
  state.ui.width = Math.ceil(editorRect.width * dpr)
  state.ui.height = Math.ceil(editorRect.height * dpr)

  canvas.width = state.ui.width
  canvas.height = state.ui.height

  overlay.width = state.ui.width
  overlay.height = state.ui.height

  debug.width = state.ui.width
  debug.height = state.ui.height

  tool.width = state.ui.width
  tool.height = state.ui.height
}

document.addEventListener("DOMContentLoaded", () => {
  getActualCanvasSize()
})

