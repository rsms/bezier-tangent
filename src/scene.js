import { Vec, vec } from "./math"
import { GroupNode } from "./node"


export class HitEvent {
  constructor(node, point, scenePoint) {
    this.node = node
    this.point = point  // in node's coordinate system
    this.scenePoint = scenePoint // updated by Scene in case of scene origin
  }
}


export class Scene extends EventEmitter {
  constructor(renderer) {
    super()
    this.renderer = renderer
    this.width  = renderer.canvas.width
    this.height = renderer.canvas.height
    this.pointer = vec(0,0)
    this.pointerDownAt = vec(0,0)  // pointer value of last pointerdown event
    this.root = new GroupNode()
    this._eventHandlers = {}
  }

  enableHitTesting() {
    let pointerDownEvent = null
    this.addEventListener("pointerdown", () => {
      if (pointerDownEvent = this.hitTest(this.pointer)) {
        this.pointerDownAt.x = this.pointer.x
        this.pointerDownAt.y = this.pointer.y
        pointerDownEvent.node.dispatchEvent("pointerdown", pointerDownEvent)
      }
    })
    this.addEventListener("pointerup", () => {
      let hitevent = this.hitTest(this.pointer)
      if (hitevent) {
        hitevent.node.dispatchEvent("pointerup", hitevent)
        if (pointerDownEvent && hitevent.node !== pointerDownEvent.node) {
          pointerDownEvent.node.dispatchEvent("pointerup", hitevent)
        }
      } else if (pointerDownEvent) {
        pointerDownEvent.node.dispatchEvent("pointerup", new HitEvent(null, null))
      }
      pointerDownEvent = null
    })
  }

  hitTest(p) {
    return this.root.hitTest(p)
  }

  addEventListener(event, handler) {
    let n = super.addEventListener(event, handler)
    if (n == 1) {
      // first handler added
      this._addEventHandler(event)
    }
    return n
  }

  removeEventListener(event, handler) {
    let n = super.removeEventListener(event, handler)
    if (n == 0) {
      // last handler removed
      this._removeEventHandler(event)
    }
    return n
  }

  _addEventHandler(event) {
    const events1 = {
      "pointermove":1,
      "pointerleave":1,
      "pointerenter":1,
      "pointerdown":1,
      "pointerup":1,
    }
    if (!(event in events1)) {
      throw new Error(`invalid event ${event}`)
    }

    let handler = (
      event == "pointermove" ? ev => {
        this.pointer.x = ev.x
        this.pointer.y = ev.y
        let delta = this.pointer.sub(this.pointerDownAt)
        this.dispatchEvent(event, delta)
      } : ev => {
        this.pointer.x = ev.x
        this.pointer.y = ev.y
        this.dispatchEvent(event, this.pointer)
      }
    )
    this.renderer.canvas.addEventListener(event, handler)
    this._eventHandlers[event] = handler
  }

  _removeEventHandler(event) {
    let handler = this._eventHandlers[event]
    if (handler) {
      delete this._eventHandlers[event]
      this.renderer.canvas.removeEventListener(event, handler)
    }
  }

  // localPointerPosition() {
  //   let p = this.pointer
  //   let m = this.renderer.g.getTransform()
  //   if (m.e != 0 || m.f != 0) {
  //     p = vec(p.x - (m.e / m.a), p.y - (m.f / m.d))
  //   }
  //   return p
  // }

  add(n) { return this.root.add(n) }
  remove(n) { this.root.remove(n) }

  updateAndDraw(g, time) {
    g.clearRect(0, 0, this.width, this.height)
    this.root.updateAndDraw(g, time)
  }
}

