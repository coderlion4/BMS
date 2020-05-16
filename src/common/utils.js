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

export function merge(FirstOBJ, SecondOBJ) {
  for (var key in SecondOBJ) {
    FirstOBJ[key] =
      FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
        ? merge(FirstOBJ[key], SecondOBJ[key])
        : (FirstOBJ[key] = SecondOBJ[key])
  }
  return FirstOBJ
}
