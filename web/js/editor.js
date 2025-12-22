import { FractalNoise } from "./noise.js"
import { debounce, clamp } from "./util.js"
import { bilinearInterpolation } from "./scale.js"
import { newState } from "./state.js"

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const editor = document.getElementById("editor")


let canvasState = newState(100, 100, ctx)

const overlayNewMap = document.getElementById("newMapOverlay")
document.getElementById("confirmNew").addEventListener("click", _ => {
  const width = parseInt(document.getElementById("mapWidth").value, 10)
  const height = parseInt(document.getElementById("mapHeight").value, 10)

  if (isNaN(width)) {
    alert("Width Input Empty")
    return
  }

  if (isNaN(height)) {
    alert("Height Input Empty")
    return
  }

  if (canvasState.dirty == true) {
    const ok = confirm("Discard current map?")
    if (!ok) return
    ctx.clearRect(0, 0, canvasState.width, canvasState.height)
  }

  canvasState = newState(width, height, ctx)

  alert("Success")

  document.getElementById("mapWidth").value = ""
  document.getElementById("mapHeight").value = ""

  overlayNewMap.style.display = "none"
})


document.getElementById("newCanvas").addEventListener("click", _ => {
  overlayNewMap.style.display = "block"
})

document.getElementById("closeModal").addEventListener("click", _ => {
  overlayNewMap.style.display = "none"
})

document.querySelector(".modal").childNodes.forEach(node => {
  node.addEventListener("click", ev => ev.stopPropagation())
})

overlayNewMap.addEventListener("click", ev => {
  if (ev.target === overlayNewMap) {
    overlayNewMap.style.display = "none"
  }
})

// Need To Change In the Future
document.getElementById("saveCanvas").addEventListener("click", _ => {
  const json = JSON.stringify(canvasState)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "test.json"
  a.click()

  canvasState.dirty = false

  URL.revokeObjectURL(url)
})

document.getElementById("openCanvas").addEventListener("click", _ => {
  const inputFile = document.createElement("input")
  inputFile.setAttribute("type", "file")
  inputFile.setAttribute("accept", "application/json")
  inputFile.value = ""
  inputFile.click()

  inputFile.addEventListener("change", loadFile)
})

const loadFile = ev => {
  const file = ev.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = e => {
    const state = JSON.parse(e.target.result)

    canvasState = state
    canvasState.imageData = ctx.createImageData(state.width, state.height)

    mapGenerator(canvasState.generator)
    drawMap()
  }
  reader.readAsText(file)
}

// This Function is Get Actual Canvas Size Because There's A DOM to consider and it follow the size of browser
function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  canvasState.width = Math.ceil(editorRect.width)
  canvasState.height = Math.ceil(editorRect.height)

  canvas.width = canvasState.width
  canvas.height = canvasState.height

  canvasState.imageData = ctx.createImageData(canvasState.width, canvasState.height)

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, canvasState.width, canvasState.height)
}

getActualCanvasSize()

let offscreen

function drawMap() {
  const { map, width, height } = canvasState

  canvasState.dirty = true

  const scaledMap = bilinearInterpolation(map, width, height)
  let index = 0
  for (let y = 0; y < scaledMap.length; y++) {
    for (let x = 0; x < scaledMap[y].length; x++) {
      const grid = scaledMap[y][x]
      const n = clamp(grid * 255 | 0, 0, 255)
      canvasState.imageData.data[index++] = n
      canvasState.imageData.data[index++] = n
      canvasState.imageData.data[index++] = n
      canvasState.imageData.data[index++] = 255
    }
  }

  ctx.putImageData(canvasState.imageData, 0, 0)

  offscreen = new OffscreenCanvas(width, height);
  const offcvs = offscreen.getContext("2d")
  offcvs.putImageData(canvasState.imageData, 0, 0)
}

generateMap.addEventListener("click", () => {
  let { generator } = canvasState
  document.querySelectorAll(".generator .form-input input[type=range]").forEach(input => {
    const key = input.dataset.key
    const value = parseFloat(input.value)
    generator[key] = value
  })

  mapGenerator(generator)
  drawMap()
})

const inputGenerator = document.querySelectorAll(".generator .form-input input")

const inputControl = debounce(ev => {
  const source = ev.target
  const wrapper = source.closest(".form-input")
  const value = parseFloat(source.value)
  const key = source.dataset.key

  wrapper.querySelectorAll("input").forEach(el => {
    if (el !== source) el.value = value
  })

  let { generator } = canvasState

  generator[key] = value
  mapGenerator(generator)
  drawMap()
}, 500)

inputGenerator.forEach(input => {
  input.addEventListener("input", inputControl)
})

function mapGenerator(option) {
  const { permutationTable, width, height } = canvasState

  let noises = []

  let max = -Infinity
  let min = Infinity

  const sampleHeight = Math.floor(height / 3)
  const sampleWidth = Math.floor(width / 3)

  for (let y = 0; y < sampleHeight; y++) {
    noises[y] = []
    for (let x = 0; x < sampleWidth; x++) {
      const noise = FractalNoise(x, y, permutationTable, option)

      if (noise > max) {
        max = noise
      }

      if (noise < min) {
        min = noise
      }

      noises[y][x] = noise
    }
  }

  canvasState.map = normalizeNoise(noises, min, max)
}

/**
  *
  * @description Convert the Map from -1 to 1 into 0 - 1
  */
function normalizeNoise(noises, min, max) {
  const range = max - min

  for (let y = 0; y < noises.length; y++) {
    for (let x = 0; x < noises[y].length; x++) {
      noises[y][x] = (noises[y][x] - min) / range
    }
  }

  return noises
}

let editorState = {
  isDragging: false,
  offsetX: 0,
  offsetY: 0
}

canvas.addEventListener("mouseup", () => editorState.isDragging = false)
canvas.addEventListener("mouseleave", () => editorState.isDragging = false)

canvas.addEventListener("mousedown", (ev) => {
  editorState.isDragging = true
  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

canvas.addEventListener("mousemove", (ev) => {
  if (!editorState.isDragging) return

  const deltaX = ev.clientX - canvasState.lastMouseX
  const deltaY = ev.clientY - canvasState.lastMouseY

  editorState.offsetX += deltaX
  editorState.offsetY += deltaY

  scheduleDraw()

  canvasState.lastMouseX = ev.clientX
  canvasState.lastMouseY = ev.clientY
})

function draw(_) {

  ctx.clearRect(0, 0, canvasState.width, canvasState.height)

  ctx.drawImage(offscreen, canvasState.offsetX, canvasState.offsetY)
}

let needsRedraw = false

function scheduleDraw() {
  if (!needsRedraw) {
    needsRedraw = true
    requestAnimationFrame((timestamp) => {
      draw(timestamp)
      needsRedraw = false
    })
  }
}
