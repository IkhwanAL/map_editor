import { html, LitElement } from "lit";
import "./draw_map_tool.js"

class BrushTool extends LitElement {
  static properties = {
    radius: { type: Number },
  }

  constructor() {
    super()
    this.radius = 20
  }

  changeInput(key) {
    return (e) => {
      this[key] = parseFloat(e.target.value)
    }
  }

  render() {
    return html`
      <div class="properties">
        <div class="form-input">
          <label>Radius</label>
          <input type="range" min="10" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
          <input type="number" min="10" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
        </div>
      </div>
    `
  }
}

customElements.define("brush-tool", BrushTool)
