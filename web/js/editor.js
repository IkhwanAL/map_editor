import { FractalNoise, NewPermutationTable } from "./noise.js"
import { sfc32 } from "./random.js"
import { debounce, clamp } from "./util.js"
import { bilinearInterpolation } from "./scale.js"

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const editor = document.getElementById("editor")

let editorState = {
  version: 1,
  seed1: null,
  seed2: null,
  seed3: null,
  seed4: null,
  width: 500,
  height: 500,
  tileSize: 1,
  map: [],
  permutationTable: [],
  imageData: null,
  generator: {
    octaves: null,
    persistence: null,
    lacunarity: null,
    frequency: null,
    amplitude: null
  },
  dirty: false
}

const overlay = document.getElementById("newMapOverlay")
// const modal = document.getElementById("newMapModal")

document.getElementById("newCanvas").addEventListener("click", _ => {
  overlay.style.display = "block"
})

document.getElementById("closeModal").addEventListener("click", _ => {
  overlay.style.display = "none"
})

document.querySelector(".modal").childNodes.forEach(node => {
  node.addEventListener("click", ev => ev.stopPropagation())
})

overlay.addEventListener("click", ev => {
  if (ev.target === overlay) {
    console.log("Outside Modal")
    overlay.style.display = "none"
  }
})

// Need To Change In the Future
document.getElementById("saveCanvas").addEventListener("click", _ => {
  const json = JSON.stringify(editorState)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "test.json"
  a.click()

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

    editorState = state
    editorState.imageData = ctx.createImageData(state.width, state.height)

    mapGenerator(editorState.generator)
    drawMap()
  }
  reader.readAsText(file)
}

// This Function is Get Actual Canvas Size Because There's A DOM to consider and it follow the size of browser
function getActualCanvasSize() {
  const editorRect = editor.getBoundingClientRect()

  editorState.width = Math.ceil(editorRect.width)
  editorState.height = Math.ceil(editorRect.height)

  canvas.width = editorState.width
  canvas.height = editorState.height

  editorState.imageData = ctx.createImageData(editorState.width, editorState.height)

  ctx.fillStyle = "#FFF"
  ctx.fillRect(0, 0, editorState.width, editorState.height)
}

getActualCanvasSize()

function drawMap() {
  const { map, width, height } = editorState

  const scaledMap = bilinearInterpolation(map, width, height)
  let index = 0
  for (let y = 0; y < scaledMap.length; y++) {
    for (let x = 0; x < scaledMap[y].length; x++) {
      const grid = scaledMap[y][x]
      const n = clamp(grid * 255 | 0, 0, 255)
      editorState.imageData.data[index++] = n
      editorState.imageData.data[index++] = n
      editorState.imageData.data[index++] = n
      editorState.imageData.data[index++] = 255
    }
  }

  ctx.putImageData(editorState.imageData, 0, 0)
}

generateMap.addEventListener("click", () => {
  let { generator } = editorState
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

  let { generator } = editorState

  generator[key] = value
  mapGenerator(generator)
  drawMap()
}, 500)

inputGenerator.forEach(input => {
  input.addEventListener("input", inputControl)
})

function setupGenerator() {
  const genSeed = () => (Math.random() * 2 ** 32) >> 0

  editorState.seed1 = genSeed()
  editorState.seed2 = genSeed()
  editorState.seed3 = genSeed()
  editorState.seed4 = genSeed()

  const rand = sfc32(editorState.seed1, editorState.seed2, editorState.seed3, editorState.seed4)

  const perm = NewPermutationTable(rand)

  editorState.permutationTable = perm
}

setupGenerator()

function mapGenerator(option) {
  const { permutationTable, width, height } = editorState

  let noises = []

  let max = -Infinity
  let min = Infinity

  const sampleHeight = Math.floor(height / 3)
  const sampleWidth = Math.floor(width / 3)

  console.log(option)
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

  editorState.map = normalizeNoise(noises, min, max)
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
