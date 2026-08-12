let idCounter = 1000

export function nextId(prefix = '') {
  idCounter += 1
  return `${prefix}${idCounter}`
}

export function mockResolve(data, delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}

export function mockReject(message, delay = 200) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay)
  })
}

export function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return function random() {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

export function daysAgo(days, hour = 10) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return date.toISOString()
}

export function daysFromNow(days, hour = 10) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export function formatNumberMock(value) {
  return Number(Number(value).toFixed(2))
}

export function weightedItem(list) {
  return list[Math.floor(Math.random() * list.length)]
}
