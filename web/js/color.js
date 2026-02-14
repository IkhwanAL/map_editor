import { ColorHex, ColorRGB } from "./state_option.js";

export const debugCollisionColor = { r: 0, g: 0, b: 255, a: 0.15 };

export function getColorHex(texture) {
  switch (texture) {
    case 1:
      return ColorHex.Grass
    case 2:
      return ColorHex.Dirt
    default:
      return ColorHex.Void
  }
}

export function getColorRGB(texture) {
  switch (texture) {
    case 1:
      return ColorRGB.Grass
    case 2:
      return ColorRGB.Dirt
    default:
      return ColorRGB.Void
  }
}
