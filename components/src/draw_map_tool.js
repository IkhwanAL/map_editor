import { LitElement, css, html } from "lit"
import { debounce } from "./util.js"

class DrawMapTool extends LitElement {
  static properties = {
    octaves: 1,
    persistence: 0.5,
    lacunarity: 2.0,
    frequency: 0.1
  }

  constructor() {
    super()
    this.octaves = 4;
    this.persistence = 0.5;
    this.lacunarity = 2.0;
    this.frequency = 0.1;

    this.dispatachDraw = debounce(() => {
      this.generateMap()
    }, 500)
  }

  static styles = css`
    .generator {
      width: max-content;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .form-input input[type="range"] {
      flex: 1;
    }

    .form-input {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 2px;
    }
  `

  generateMap() {
    const detail = {
      octaves: this.octaves,
      persistence: this.persistence,
      lacunarity: this.lacunarity,
      frequency: this.frequency
    }
    const event = new CustomEvent("drawMap", { detail, composed: true, bubbles: true })

    this.dispatchEvent(event)
  }

  changeInput(key) {
    return (e) => {
      this[key] = parseFloat(e.target.value)
      this.dispatachDraw()
    }
  }

  render() {
    return html`
    <div class="generator">
      <button @click=${this.generateMap}>Generate Map</button>
      <div class="form-input">
        <label>Octaves</label>
        <input type="range" min="1" max="10" step="1" .value=${this.octaves} @input=${this.changeInput("octaves")}/>
        <input type="number" id="field" min="1" max="10" step="1" .value=${this.octaves} @input=${this.changeInput("octaves")}/>
      </div >
      <div class="form-input">
        <label>Persistence</label>
        <input type="range" min="0.1" max="1" id="persistence" step="0.05" .value=${this.persistence} @input=${this.changeInput("persistence")}/>
        <input type="number" id="field" min="1" max="3" step="0.05" .value=${this.persistence} @input=${this.changeInput("persistence")}/>
      </div>
      <div class="form-input">
        <label>Lacunarity</label>
        <input type="range" min="1" max="3" id="lacunarity" step="0.1" .value=${this.lacunarity} @input=${this.changeInput("lacunarity")}/>
        <input type="number" id="field" min="1" max="3" step="0.1" .value=${this.lacunarity} @input=${this.changeInput("lacunarity")}/>
      </div>
      <div class="form-input">
        <label>Frequency</label>
        <input type="range" min="0.005" max="0.2" id="frequency" step="0.005" .value=${this.frequency} @input=${this.changeInput("frequency")}/>
        <input type="number" id="field" min="0.005" max="0.2" step="0.005" .value=${this.frequency} @input=${this.changeInput("frequency")}/>
      </div >
    </div >
  `
  }
}

customElements.define("draw-map-tool", DrawMapTool)
