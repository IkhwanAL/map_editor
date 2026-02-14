export function isInvalid(tile) {
  const empty = tile.terrain === EmptyTile
  const noOccupy = tile.occupied === 0
  const hasCollision = tile.collision === 1

  if (empty && noOccupy) return true
  if (empty && hasCollision) return true

  return false
}

export function checkAllowModifiedCollision(worldChunk, value, chunkIndex) {
  if (!worldChunk) return false // if the chunk never created cancel modified
  if (worldChunk.collision[chunkIndex] == value) return false // if the collision already exists 
  if (worldChunk.occupied[chunkIndex] == 0) return false // if the tile never exist

  return true
}
