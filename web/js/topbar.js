import { canvasState, freshNewState, newState, setCanvasState } from "./state.js"
import { mapGenerator, drawMap, drawCanvasFromLoadedState } from "./canvas.js"
import { convertStateToSavedJson } from "./convert.js"


const overlayNewMap = document.getElementById("newMapOverlay")
document.getElementById("confirmNew").addEventListener("click", _ => {
  if (canvasState.dirty == true) {
    const ok = confirm("Discard current map?")
    if (!ok) return
    ctx.clearRect(0, 0, canvasState.width, canvasState.height)
  }

  setCanvasState(newState())

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
  const state = convertStateToSavedJson(canvasState)

  state.stopUndo = state.chunkOrders.length

  const json = JSON.stringify(state)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "test.json" // Name Something Better or Open a File Choser
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

    loadState(state)

  }
  reader.readAsText(file)
}

function loadState(state) {
  if (canvasState.dirty == true) {
    const ok = confirm("Discard current map?")
    if (!ok) return
  }

  let newState = freshNewState()
  newState = { ...newState, ...state }

  newState = drawCanvasFromLoadedState(newState)
  setCanvasState(newState)
}
