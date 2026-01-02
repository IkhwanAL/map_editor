export function convertStateToSavedJson(view) {

  const allNewChunkOrder = []

  for (let i = 0; i < view.chunkOrders.length; i++) {
    const chunk = view.chunkOrders[i];

    const { imageData } = chunk
    const temp = Array.from(imageData.data)

    const newChunk = { ...chunk, imageData: temp }

    allNewChunkOrder.push(newChunk)
  }

  const { chunkOrders, ...oldState } = view

  const newState = structuredClone(oldState)

  newState.chunkOrders = allNewChunkOrder

  return newState
}
