import { vec, Rect } from "../math"


export class Stroke {
  constructor(color, weight) {
    this.color = color
    this.weight = weight
  }
}
Stroke.default = new Stroke("black", 1)


export class Node extends EventEmitter {
  constructor(position) {
    super()
    this.parent = null
    this.position = position || vec(0,0)
    this._bounds = new Rect(0,0,0,0)
    this.visible = true
    this.transform = null  // optional matrix
    this.needsRecompute = true  // true when recompute() needs to be called on next update
  }

  dirty() {
    this.needsRecompute = true
  }

  recompute() {
    // Called when first-level properties has changed. Recompute derived data like bounds.
    this.needsRecompute = false
    this._bounds.x = this.position.x
    this._bounds.y = this.position.y
  }

  get bounds() {
    if (this.needsRecompute) {
      this.recompute()
    }
    return this._bounds
  }

  updateAndDraw(g, time) {
    // Called by renderer each frame. Don't override this; instead override update() and draw().
    if (this.visible) {
      if (this.needsRecompute) {
        this.recompute()
      }
      this.update(time, g)
      this.draw(g, time)
    }
  }

  update(time, g) {}  // Update state that depends on time
  draw(g, time) {}    // Draw to graphics context g

  remove() {
    if (this.parent) {
      this.parent.remove(this)
    }
  }
  pointFromSceneSpace(p) {
    if (this.parent) {
      return this.parent.pointFromSceneSpace(p)
    }
    return p
  }
  hitTest(p) {
    return null
  }
}


export class DrawableNode extends Node {
  constructor(position, fill, stroke) {
    super(position)
    this.interactive = true  // participates in hit testing
    this.position = position || vec(0,0)
    this.fill = fill === undefined ? "white" : fill
    if (typeof stroke == "string") {
      stroke = new Stroke(stroke, 1)
    }
    this.stroke = stroke || null
  }

  draw(g) {
    g.fillStyle = this.fill
    if (this.stroke) {
      g.strokeStyle = this.stroke.color
      g.lineWidth   = this.stroke.weight
    }
  }

  hitTest(p) {
    // log(`${this.constructor.name}.hitTest p=${p} bounds=${this.bounds}`)
    if (this.interactive && this.bounds.containsPoint(p)) {
      return new HitEvent(this, p)
    }
    return null
  }
}
