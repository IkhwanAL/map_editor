import { css } from "lit"

export const formStyle = css`
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

export const toggleStyle = css`
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* hide the real checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* the track */
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 34px;
}

/* the knob */
.slider::before {
  content: "";
  position: absolute;
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

/* when checked */
.switch input:checked + .slider {
  background-color: #4caf50;
}

.switch input:checked + .slider::before {
  transform: translateX(26px);
}
`
