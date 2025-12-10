/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const editor = document.getElementById("editor")

let mapWidth = canvas.width
let mapHeight = canvas.height
const tileSize = 5

let map = []

// This Function is Get Actual Canvas Size Because There's A DOM to consider and it follow the size of browser
function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  mapWidth = editorRect.width
  mapHeight = editorRect.height

  canvas.width = mapWidth
  canvas.height = mapHeight

}

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

getActualCanvasSize()
generateMap()
drawMap()
