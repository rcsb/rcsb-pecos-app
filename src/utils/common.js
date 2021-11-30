export function deepEqual(a, b) {
  // from https://github.com/epoberezkin/fast-deep-equal MIT
  if (a === b) return true

  const arrA = Array.isArray(a)
  const arrB = Array.isArray(b)

  if (arrA && arrB) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (arrA !== arrB) return false

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false

    const dateA = a instanceof Date
    const dateB = b instanceof Date
    if (dateA && dateB) return a.getTime() === b.getTime()
    if (dateA !== dateB) return false

    const regexpA = a instanceof RegExp
    const regexpB = b instanceof RegExp
    if (regexpA && regexpB) return a.toString() === b.toString()
    if (regexpA !== regexpB) return false

    for (let i = 0; i < keys.length; i++) {
      if (!hasOwnProperty.call(b, keys[i])) return false
    }

    for (let i = 0; i < keys.length; i++) {
      if (!deepEqual(a[keys[i]], b[keys[i]])) return false
    }

    return true
  }

  return false
}

export function hexToStyle(hexColor, alpha) {
  return (
    'rgb(' +
    ((hexColor >> 16) & 255) +
    ', ' +
    ((hexColor >> 8) & 255) +
    ', ' +
    (hexColor & 255) +
    ',' +
    alpha +
    ')'
  );
}

export function memoizeOneArgAsync(f) {
  const cache = new Map();
  return async function (arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    } else {
      const value = await f(arg);
      cache.set(arg, value);
      return value;
    }
  }
}

function isEmpty(value) {
  if (value instanceof Object) return Object.keys(value).length === 0;
  else if (value instanceof Array) return value.length === 0;
  else return value === undefined || value === null;
}

// Will remove all falsy values accept zeros
function cleanArray(actual) {
  const updated = new Array();
  for (let i = 0; i < actual.length; i++) {
    const value = actual[i]
    clean(value);
    if (isEmpty(value)) continue;
    updated.push(actual[i]);
  }
  return updated;
}

export function clean(input) {

  if (input instanceof Array) {
    input = cleanArray(input)
    for (const value of input) {
      clean(value)
    }
  } else if (input instanceof File) {
    return input
  } else if (input instanceof Object) {
    for (let propName in input) {
      const value = input[propName]
      if (isEmpty(value)) {
        delete input[propName];
      } else {
        input[propName] = clean(value)
      }
    }
  }
  return input
}

export function createAsymLabel(asymId, authAsymId) {
  return (!authAsymId || asymId == authAsymId) ? asymId : `${asymId} [auth ${authAsymId}]`
}

export function createInstanceId(entryId, asymId) {
  return `${entryId}.${asymId}`
}