export function deepClone(Target, Origin) {
  if (Origin === null) return
  for (let prop in Origin) {
    if (Origin[prop] && typeof Origin[prop] === 'object') {
      if (Object.prototype.toString.call(Origin[prop]) === '[object Array]') {
        Target[prop] = []
      } else {
        Target[prop] = {}
      }
      deepClone(Target[prop], Origin[prop])
    } else {
      Target[prop] = Origin[prop]
    }
  }
  return Target
}
