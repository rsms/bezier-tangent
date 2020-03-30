const GlobalContext = (
  typeof global != 'undefined' ? global :
  typeof window != 'undefined' ? window :
  this || {}
)

const log = console.log.bind(console)
const dlog = DEBUG ? console.log.bind(console) : function(){}

const $$ = (q, e) => Array.prototype.slice.call((e || document).querySelectorAll(q))
const $  = (q, e) => (e || document).querySelector(q)


class EventEmitter {
  constructor() {
    this._events = new Map() // <keyof EventMap,Set<EventHandler>>
  }

  on(event, handler) { return this.addEventListener(event, handler) }
  off(event, handler) { return this.removeEventListener(event, handler) }

  addEventListener(event, handler) {
    // Returns the number of handlers registered for event, after adding handler.
    let s = this._events.get(event)
    if (s) {
      s.add(handler)
    } else {
      s = new Set([handler])
      this._events.set(event, s)
    }
    return s.size
  }

  removeEventListener(event, handler) {
    // Returns the number of handlers registered for event, after removing handler.
    // Returns -1 if handler was not registered for the event.
    let s = this._events.get(event)
    if (!s || !s.delete(handler)) {
      return -1
    }
    if (s.size == 0) {
      this._events.delete(event)
    }
    return s.size
  }

  dispatchEvent(event, data) {
    let s = this._events.get(event)
    if (s) for (let handler of s) {
      handler(data)
    }
  }
}


function _stackTrace(cons) {
  const x = {stack:''}
  if (Error.captureStackTrace) {
    Error.captureStackTrace(x, cons)
    const p = x.stack.indexOf('\n')
    if (p != -1) {
      return x.stack.substr(p+1)
    }
  }
  return x.stack
}

// _parseStackFrame(sf :string) : StackFrameInfo | null
// interface StackFrameInfo {
//   func :string
//   file :string
//   line :int
//   col  :int
// }
//
function _parseStackFrame(sf) {
  let m = /\s*at\s+(?:[^\s]+\.|)([^\s\.]+)\s+(?:\[as ([^\]]+)\]\s+|)\((?:.+[\/ ](src\/[^\:]+)|([^\:]*))(?:\:(\d+)\:(\d+)|.*)\)/.exec(sf)
  // 1: name
  // 2: as-name | undefined
  // 3: src-filename
  // 4: filename
  // 5: line
  // 6: column
  //
  if (m) {
    return {
      func: m[2] || m[1],
      file: m[3] || m[4],
      line: m[5] ? parseInt(m[5]) : 0,
      col:  m[6] ? parseInt(m[6]) : 0,
    }
  } else {
    console.log("failed to parse stack frame", JSON.stringify(sf))
  }
  return null
}

function assert() {
  if (DEBUG) {
    let cond = arguments[0], msg = arguments[1], cons = (arguments[2] || assert)
    if (!cond) {
      let stack = _stackTrace(cons)
      let message = 'assertion failure: ' + (msg || cond)
      if (!assert.throws && typeof process != 'undefined') {
        console.error(message + "\n" + stack)
        process.exit(3)
      } else {
        let e = new Error(message)
        e.name = 'AssertionError'
        e.stack = stack
        throw e
      }
    }
  }
}


// export as globals since local names are mangled by esbuild
GlobalContext["GlobalContext"] = GlobalContext
GlobalContext["log"] = log
GlobalContext["dlog"] = dlog
GlobalContext["$"] = $
GlobalContext["$$"] = $$
GlobalContext["EventEmitter"] = EventEmitter
GlobalContext["assert"] = assert
