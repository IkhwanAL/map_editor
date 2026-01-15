import { CHUNK_SIZE } from "./state.js";
import { clamp } from "./util.js";

export function updatePixels(chunk, pixels) {
  let index = 0
  for (let i = 0; i < chunk.data.length; i++) {
    let data = chunk.data[i];
    const occupied = chunk.occupied[i]

    data = (data + 1) * 0.5
    let value = clamp(data * 255 | 0, 0, 255)
    if (occupied == 0) value = 255

    pixels[index++] = value
    pixels[index++] = value
    pixels[index++] = value
    pixels[index++] = 255
  }
}

export function createPixels(chunk, pixels) {
  let rgbIdx = 0
  for (let index = 0; index < CHUNK_SIZE * CHUNK_SIZE; index++) {
    let value = chunk.data[index]
    const occupied = chunk.occupied[index]

    value = (value + 1) * 0.5
    value = clamp(value * 255 | 0, 0, 255)
    if (occupied == 0) {
      value = 255
    }

    pixels[rgbIdx++] = value
    pixels[rgbIdx++] = value
    pixels[rgbIdx++] = value
    pixels[rgbIdx++] = 255
  }
}

export function getChunkCoordinate(worldCoordinate) {
  return Math.floor(worldCoordinate / CHUNK_SIZE)
}

export function getWorldCoordinate(chunkCoordinate) {
  return Math.floor(chunkCoordinate * CHUNK_SIZE)
}

export function getLocalChunkCoordinate(worldCoordinate, chunkCoordinate) {
  return Math.floor(worldCoordinate - chunkCoordinate * CHUNK_SIZE)
}

