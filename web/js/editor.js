/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("editor")
const ctx = canvas.getContext("2d")

const mapWidth = canvas.width
const mapHeight = canvas.height
const tileSize = 16

let map = []

function generateMap() {
  for (let y = 0; y < mapHeight; y++) {
    map[y] = []
    for (let x = 0; x < mapWidth; x++) {
      map[y][x] = Math.random() > 0.5 ? 1 : 0
    }
  }
}

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = map[y][x] === 1 ? "#4caf50" : "#795548";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    }
  }
}

generateMap()
drawMap()
