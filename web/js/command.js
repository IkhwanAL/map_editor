import { CHUNK_SIZE } from "./state";

export function createCommand(type, timestamp) {
  return {
    type: type,
    timestamp: timestamp,
    snapshot: new Map()
  }
}

export function parseCommand(world, command) {
  const affectedChunk = new Map()
  const undoRedoInfo = []

  for (const [coordinate, commit] of command.snapshot) {
    const chunk = world.chunks.get(coordinate)
    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      if (commit.occupied[x]) return

      affectedChunk.set(coordinate, commit)

      if (commit.data[x] != chunk.data[x] || commit.occupied[x] != chunk.occupied[x]) {
        undoRedoInfo.push({
          index: x,
          cx: commit.cx,
          cy: commit.cy,
          before: { data: chunk.data[x] ?? 0, occupied: chunk.occupied[x] ?? -1 },
          after: { data: commit.data[x], occupied: commit.occupied[x] }
        })
      }
    }
  }

  return { affectedChunk, undoRedoInfo }
}

export function applyCommand(world, view, affectedChunk) {
  for (const [coor, commit] of affectedChunk) {
    let viewChunk = view.chunkOrders.get(coor)
    if (viewChunk) viewChunk.dirty = true

    let chunk = world.chunks.get(coor)
    if (!chunk) {
      const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(-1)
      const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
      chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
      world.chunks.set(coordinate, chunk)
    }

    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      chunk.data[x] = commit.data
      chunk.occupied[x] = commit.occupied
    }

    chunk.dirty = true
  }
}
