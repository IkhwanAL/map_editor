import { CHUNK_SIZE } from "./state.js";

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
    affectedChunk.set(coordinate, commit)
    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      if (commit.data[x] == -1 && commit.occupied[x] == 0) continue
      undoRedoInfo.push({
        index: x,
        cx: commit.cx,
        cy: commit.cy,
        before: { data: chunk?.data[x] ?? -1, occupied: chunk?.occupied[x] ?? 0 },
        after: { data: commit.data[x], occupied: commit.occupied[x] }
      })
    }
  }

  return { affectedChunk, undoRedoInfo }
}

export function applyUndoRedoEffect(undoRedoInfo) {
  const undoApplied = []
  for (const change of undoRedoInfo) {
    if (change.before.data != change.after.data || change.before.occupied != change.after.occupied) {
      undoApplied.push(change)
    }
  }

  return undoApplied
}

export function applyCommand(world, view, affectedChunk) {
  for (const [coordinate, commit] of affectedChunk) {
    const { cx, cy } = commit
    // if it's part of cache, mark it dirty
    let viewChunk = view.chunkOrders.get(coordinate)
    if (viewChunk) viewChunk.dirty = true

    let chunk = world.chunks.get(coordinate)
    if (!chunk) {
      const float32 = new Float32Array(CHUNK_SIZE * CHUNK_SIZE).fill(-1)
      const uint8 = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
      chunk = { cx: cx, cy: cy, data: float32, occupied: uint8, dirty: false }
      world.chunks.set(coordinate, chunk)
    }

    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      if (commit.data[x] == -1 && commit.occupied[x] == 0) continue
      chunk.data[x] = commit.data[x]
      chunk.occupied[x] = commit.occupied[x]
    }
  }
}
