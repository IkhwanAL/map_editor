import { getOrCreateWorldChunk, getViewCacheChunkToChange } from "./chunk.js";
import { CHUNK_SIZE } from "./state.js";
import { EmptyTile, NoCollision, StrokeMode } from "./state_option.js";

export function createCommand(type, timestamp, mode) {
  return {
    type: type,
    timestamp: timestamp,
    snapshot: new Map(),
    mode: mode
  }
}

export function parseCommand(world, command) {
  const affectedChunk = new Map()
  const undoRedoInfo = []

  for (const [coordinate, commit] of command.snapshot) {
    const chunk = world.chunks.get(coordinate)
    let affectedCommit = {
      cx: commit.cx,
      cy: commit.cy,
      collision: new Map(),
      terrain: new Map(),
      occupied: new Map()
    }
    for (let x = 0; x < CHUNK_SIZE * CHUNK_SIZE; x++) {
      const terrain = commit.terrain.get(x)
      const collision = commit.collision.get(x)

      const current = {
        terrain: chunk?.terrain[x] ?? EmptyTile,
        occupied: chunk?.occupied[x] ?? 0,
        collision: chunk?.collision[x] ?? NoCollision
      }

      let next = { ...current }

      if (terrain && terrain != EmptyTile) {
        affectedCommit.terrain.set(x, terrain)
        affectedCommit.occupied.set(x, 1) // Force To One since i don't have the tool to delete

        current.terrain = terrain
        current.occupied = 1
      }

      if (collision) {
        affectedCommit.collision.set(x, collision)

        current.collision = collision
      }

      undoRedoInfo.push({
        index: x,
        cx: commit.cx,
        cy: commit.cy,
        before: current,
        after: next
      })
    }
    affectedChunk.set(coordinate, affectedCommit)
  }

  return { affectedChunk, undoRedoInfo }
}

export function applyUndoRedoEffect(undoRedoInfo) {
  const undoApplied = []

  let diffTerrain = false
  let diffOccupied = false
  let diffCollision = false

  for (const change of undoRedoInfo) {
    if (change.before.terrain != change.after.terrain) diffTerrain = true
    if (change.before.occupied != change.after.occupied) diffOccupied = true
    if (change.before.collision != change.after.collision) diffCollision = true

    if (diffTerrain || diffOccupied || diffCollision) undoApplied.push(change)
  }

  return undoApplied
}

export function applyCommand(world, view, mode, affectedChunk) {
  for (const [coordinate, commit] of affectedChunk) {
    const { cx, cy } = commit
    // if it's part of cache, mark it dirty
    let viewChunks = getViewCacheChunkToChange(view, mode, coordinate)
    if (viewChunks) viewChunks.dirty = true

    let chunk = getOrCreateWorldChunk(world, coordinate, cx, cy)
    for (let [x, value] of commit.terrain) {
      chunk.terrain[x] = value
    }

    for (let [x, value] of commit.occupied) {
      chunk.occupied[x] = value
    }

    for (let [x, value] of commit.collision) {
      chunk.collision[x] = value
    }

  }
}
