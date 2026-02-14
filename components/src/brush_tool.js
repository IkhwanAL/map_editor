import { html, LitElement } from "lit";
import { formStyle, toggleStyle } from "./share_css";

class BrushTool extends LitElement {
  static properties = {
    radius: { type: Number },
    mode: { type: String },
    texture: { type: String },
    collision: { type: Boolean }
  }

  static styles = [
    formStyle,
  ]

  constructor() {
    super()
    this.radius = 20;
    this.mode = "terrain"
    this.texture = "grass"
    this.collision = false
  }

  changeInput(key) {
    return (e) => {
      this[key] = parseFloat(e.target.value)
    }
  }

  changeSelectionTarget(e) {
    this.mode = e.target.value
  }

  changeSelectionTexture(e) {
    this.texture = e.target.value
  }

  changeCheckBoxOption(e) {
    this.collision = e.target.checked
  }

  render() {
    let configuration = html``;

    // TODO: Next Choose Color Or Something
    if (this.mode == "terrain") {
      configuration = html`
        <div class="form-input">
          <label>Terrain Option</label>
          <select name="texture" id="texture" @change=${this.changeSelectionTexture}>
            <option value="grass">Grass</option>
            <option value="dirt">Dirt</option>
            <option value="cliff">Cliff</option>
          </select>
        </div>
      `
    }

    if (this.mode == "collision") {
      configuration = html`
        <div class="form-input">
          <label class="switch">
            <span>Add Collision</span>
            <input type="checkbox" .checked=${this.collision} @change=${this.changeCheckBoxOption}>
          </label>
        </div>
      `
    }

    return html`
      <div class="properties">
        <div class="form-input">
          <label>Radius</label>
          <input type="range" min="2" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
          <input type="number" min="2" max="100" step="5" .value=${this.radius} @input=${this.changeInput("radius")}/>
        </div>

        <div class="form-input">
          <label>Target</label>
          <select name="mode" id="mode" @change=${this.changeSelectionTarget}>
            <option value="terrain">Terrain</option>
            <option value="collision">Collision</option>
          </select>
        </div>

        ${configuration}
      </div>
    `
  }
}

customElements.define("brush-tool", BrushTool)
