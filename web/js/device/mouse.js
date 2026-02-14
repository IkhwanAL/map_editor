/**
 * @param {HTMLCanvasElement} canvas 
 * @param {number} clientX 
 * @param {number} clientY
 */
export function getMousePositionInCanvas(canvas, clientX, clientY) {
  const boundary = canvas.getBoundingClientRect()
  const scaleX = canvas.width / boundary.width
  const scaleY = canvas.height / boundary.height

  const mouseX = (clientX - boundary.left) * scaleX
  const mouseY = (clientY - boundary.top) * scaleY

  return { mouseX, mouseY, scaleX, scaleY }
}
