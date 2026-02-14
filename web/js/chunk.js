import { getChunkCoordinate, getLocalChunkCoordinate } from "./pixel.js";
import { checkAllowModifiedCollision } from "./rules.js";
import { CHUNK_SIZE, state } from "./state.js"
import { StrokeMode } from "./state_option.js";

export function getPreviewChunk(mode, coordinate) {
  let viewChunk = null
  switch (mode) {
    case StrokeMode.Terrain:
      viewChunk = state.ui.previewChunks.get(coordinate)
      if (!viewChunk) {
        const cvs = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
        const ctx = cvs.getContext("2d")
        ctx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE)

        viewChunk = { cvs, ctx }
        state.ui.previewChunks.set(coordinate, viewChunk)
      }
      break;
    case StrokeMode.Collision:
      viewChunk = state.ui.previewCollisionChunks.get(coordinate)
      if (!viewChunk) {
        const cvs = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE)
        const ctx = cvs.getContext("2d")
        ctx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE)

        viewChunk = { cvs, ctx }
        state.ui.previewCollisionChunks.set(coordinate, viewChunk)
      }
    default:
      break;
  }

  return viewChunk
}

export function getOrCreateWorldChunk(world, coordinate, cx, cy) {
  let chunk = world.chunks.get(coordinate)
  if (!chunk) {
    const terrain = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    const collision = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    const occupied = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE).fill(0)
    chunk = { cx: cx, cy: cy, terrain: terrain, occupied: occupied, collision: collision, dirty: false }
    world.chunks.set(coordinate, chunk)
  }

  return chunk
}

export function storeChunk(worldX, worldY, value, rgb, mode) {
  const cx = getChunkCoordinate(worldX)
  const cy = getChunkCoordinate(worldY)
  const key = cx + "," + cy

  const localX = getLocalChunkCoordinate(worldX, cx)
  const localY = getLocalChunkCoordinate(worldY, cy)

  let viewChunk = getPreviewChunk(mode, key)
  console.assert(viewChunk != null, "View Chunk Should not be Null")

  viewChunk.ctx.fillStyle = rgb
  viewChunk.ctx.fillRect(localX, localY, 1, 1)

  let chunk = state.ui.userCommand.snapshot.get(key)
  if (!chunk) {
    chunk = {
      cx, cy,
      terrain: new Map(),
      collision: new Map(),
    }
    state.ui.userCommand.snapshot.set(key, chunk)
  }
  console.assert(chunk != null, "Chunk Should not be Null")

  const i = localY * CHUNK_SIZE + localX
  console.assert(i >= 0 && i < 256, "Index Chunk Is too small or too big")

  const worldChunk = state.world.chunks.get(key)

  switch (mode) {
    case StrokeMode.Terrain:
      if (worldChunk && worldChunk.occupied[i] == 1) return
      chunk.terrain.set(i, value);
      break;
    case StrokeMode.Collision:
      if (!checkAllowModifiedCollision(worldChunk, value)) return
      chunk.collision.set(i, value)
      break
    default:
      break;
  }
}

export function getViewCacheChunkToChange(view, mode, coordinate) {
  switch (mode) {
    case StrokeMode.Terrain:
      return view.terrainChunks.get(coordinate)
    case StrokeMode.Collision:
      return view.collisionChunks.get(coordinate)
    default:
      break;
  }
}
