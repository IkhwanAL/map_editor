import { mapGenerator, drawMap } from "./canvas.js"
import { debounce } from "./util.js"
import { canvasState, editorState } from "./state.js"

document.getElementById("press-drag").addEventListener("click", _ => {
  const button = document.getElementById("press-drag")
  if (editorState.state == "dragging") {
    editorState.state = "press-drag"
    button.style.border = "1px solid blue"
    return
  }

  // return old state
  editorState.state = "dragging"
  button.style.border = "none"
})

document.getElementById("generateMap").addEventListener("click", () => {
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

