import { loadViewStateFromSavedState } from "./canvas.js"
import { state, newState, setWorldState, saveState, reformSavedState } from "./state.js"

const overlayNewMap = document.getElementById("newMapOverlay")
document.getElementById("confirmNew").addEventListener("click", _ => {
  if (state.view.dirty == true) {
    const ok = confirm("Discard current map?")
    if (!ok) return
    ctx.clearRect(0, 0, state.ui.width, state.ui.height)
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

// TODO: Maybe Add Custom Name So User Can Name the File They Want
document.getElementById("saveCanvas").addEventListener("click", _ => {
  const toSavedState = saveState(state.world)

  const stringifySavedState = JSON.stringify(toSavedState)
  const blobSavedState = new Blob([stringifySavedState], { type: "application/json" })
  const url = URL.createObjectURL(blobSavedState)

  const a = document.createElement("a")
  a.href = url
  a.download = "test.json" // Name Something Better or Open a File Choser
  a.click()

  state.view.dirty = false

  URL.revokeObjectURL(url)

  return
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

function loadState(newState) {
  if (state.view.dirty == true) {
    const ok = confirm("Discard current map?")
    if (!ok) return
  }

  const worldState = reformSavedState(newState)
  setWorldState(worldState)
  loadViewStateFromSavedState(state)
}
