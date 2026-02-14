import { debugCollisionColor, getColorRGB } from "./color.js";
import { CHUNK_SIZE } from "./state.js";

export function updatePixels(chunk, pixels) {
  let rgbIdx = 0
  for (let i = 0; i < chunk.terrain.length; i++) {
    let data = getColorRGB(chunk.terrain[i]);
    const occupied = chunk.occupied[i]

    if (occupied == 1) {
      pixels[rgbIdx++] = data.r
      pixels[rgbIdx++] = data.g
      pixels[rgbIdx++] = data.b
      pixels[rgbIdx++] = data.a * 255
    } else {
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
    }
  }
}

export function setCollisionPixel(chunk, pixels) {
  let rgbIdx = 0
  for (let i = 0; i < chunk.collision.length; i++) {
    let hasCollision = chunk.collision[i]

    const color = debugCollisionColor
    if (hasCollision == 1) {
      pixels[rgbIdx++] = color.r
      pixels[rgbIdx++] = color.g
      pixels[rgbIdx++] = color.b
      pixels[rgbIdx++] = color.a * 255
    } else {
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
    }
  }
}

export function createPixels(chunk, pixels) {
  let rgbIdx = 0
  for (let index = 0; index < CHUNK_SIZE * CHUNK_SIZE; index++) {
    let data = getColorRGB(chunk.terrain[index])
    const occupied = chunk.occupied[index]

    if (occupied == 1) {
      pixels[rgbIdx++] = data.r
      pixels[rgbIdx++] = data.g
      pixels[rgbIdx++] = data.b
      pixels[rgbIdx++] = data.a * 255
    } else {
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
      pixels[rgbIdx++] = 0
    }

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

