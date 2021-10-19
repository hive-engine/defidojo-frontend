export const groupBy = (data, key) => {
  return data.reduce(function (storage, item) {
    const group = item[key]
    storage[group] = storage[group] || []

    storage[group].push(item)
    return storage
  }, {})
}

export const arrayChunk = (array, size = 20) => {
  const chunkedArray = []
  let index = 0

  while (index < array.length) {
    chunkedArray.push(array.slice(index, size + index))
    index += size
  }

  return chunkedArray
}
