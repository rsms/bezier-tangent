import { vec } from "../math"
import { DrawableNode } from "./node"

export class CubicBezierNode extends DrawableNode {
  constructor(start, c1, c2, end, stroke) {
    super(start, null, stroke || Stroke.default)
    this.c1 = c1
    this.c2 = c2
    this.end = end
    this.interpolationData = {x1:0,x2:0,x3:0,x4:0, y1:0,y2:0,y3:0,y4:0}
  }

  recompute() {
    super.recompute()
    this.updateInterpolationData()
  }

  updateInterpolationData() {
    const D = this.interpolationData
    let a = this.position.x, b = this.c1.x, c = this.c2.x, d = this.end.x
    D.x1 = d - (3.0 * c) + (3.0 * b) - a
    D.x2 = (3.0 * c) - (6.0 * b) + (3.0 * a)
    D.x3 = (3.0 * b) - (3.0 * a)
    D.x4 = a
    a = this.position.y, b = this.c1.y, c = this.c2.y, d = this.end.y
    D.y1 = d - (3.0 * c) + (3.0 * b) - a
    D.y2 = (3.0 * c) - (6.0 * b) + (3.0 * a)
    D.y3 = (3.0 * b) - (3.0 * a)
    D.y4 = a
  }

  pointAt(t) {  // t [0-1]
    const D = this.interpolationData
    return vec(
      ( D.x1*t*t*t + D.x2*t*t + D.x3*t + D.x4 ),
      ( D.y1*t*t*t + D.y2*t*t + D.y3*t + D.y4 )
    )
  }

  normalAt(t) {
    return this.tangentAt(t).rotate(90)
  }

  tangentAt(t) {
    const D = this.interpolationData
    return vec(
      ( ( 3.0 * D.x1 * t* t ) + ( 2.0 * D.x2 * t ) + D.x3 ),
      ( ( 3.0 * D.y1 * t* t ) + ( 2.0 * D.y2 * t ) + D.y3 )
    )
  }

  // Find the closest point on a Bézier curve to p
  // Returns [p :Vec, t :number]
  closestPoint(p) {
    // More samples increases the chance of being correct
    let mindex = 0, samples = 25
    for (let min = Infinity, i = samples + 1; i-- ;) {
      let d2 = p.squaredDistanceTo(this.pointAt(i / samples))
      if (d2 < min) {
        min = d2
        mindex = i
      }
    }

    // Find a minimum point for a bounded function. May be a local minimum.
    let minX = Math.max((mindex - 1) / samples, 0)
    let maxX = Math.min((mindex + 1) / samples, 1)
    let p2, t2 = 0
    let f = t => {
      t2 = t
      p2 = this.pointAt(t)
      return p.squaredDistanceTo(p2)
    }
    let e = 1e-4
    let k = 0.0
    while ((maxX - minX) > e) {
      k = (maxX + minX) / 2
      if (f(k - e) < f(k + e)) {
        maxX = k
      } else {
        minX = k
      }
    }
    return [p2, t2]
  }

  draw(g) {
    super.draw(g)
    g.beginPath()
    g.moveTo(this.position.x, this.position.y)
    g.bezierCurveTo(this.c1.x, this.c1.y, this.c2.x, this.c2.y, this.end.x, this.end.y)
    g.strokeStyle = this.stroke.color
    g.lineWidth = this.stroke.weight
    g.stroke()
  }
}
