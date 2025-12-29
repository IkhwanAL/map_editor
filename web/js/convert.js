export function convertStateToSavedJson(state) {

  const allNewChunkOrder = []

  for (let i = 0; i < state.chunkOrders.length; i++) {
    const chunk = state.chunkOrders[i];

    const { imageData } = chunk
    const temp = Array.from(imageData.data)

    const newChunk = { ...chunk, imageData: temp }

    allNewChunkOrder.push(newChunk)
  }

  const { chunkOrders, chunkAccess, ...oldState } = state

  const newState = structuredClone(oldState)

  newState.chunkOrders = allNewChunkOrder

  delete newState.map
  delete newState.lastMouseX
  delete newState.lastMouseY
  delete newState.dirty

  return newState
}
