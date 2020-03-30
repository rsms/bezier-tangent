import { vec } from "../math"
import { DrawableNode } from "./node"

export class LineNode extends DrawableNode {
  constructor(start, end, stroke) {
    super(start, null, stroke || Stroke.default)
    this.end = end || vec(0, 0)
  }

  draw(g) {
    super.draw(g)
    g.beginPath()
    g.moveTo(this.position.x, this.position.y)
    g.lineTo(this.end.x, this.end.y)
    g.stroke()
  }

  get length() {
    return this.position.distanceTo(this.end)
  }

  set length(len) {
    let angle = this.position.angleTo(this.end)
    this.end = vec(
      this.position.x + len * Math.cos(angle),
      this.position.y + len * Math.sin(angle)
    )
  }

  rotate(degrees) {
    let radians = (Math.PI / 180) * degrees
    let cos = Math.cos(radians)
    let sin = Math.sin(radians)
    let p1 = this.position
    let p2 = this.end
    this.end = vec(
      (cos * (p2.x - p1.x)) + (sin * (p2.y - p1.y)) + p1.x,
      (cos * (p2.y - p1.y)) - (sin * (p2.x - p1.x)) + p1.y
    )
  }

  hitTest(p) { return null }
}


export class DiscNode extends DrawableNode {
  constructor(position, radius, fill, stroke) {
    super(position, fill, stroke)
    this.radius = radius || 10
    this.size = this.radius * 2
  }

  recompute() {
    super.recompute()
    this.bounds.x = this.position.x - this.radius
    this.bounds.y = this.position.y - this.radius
    this.bounds.width = this.radius * 2
    this.bounds.height = this.radius * 2
  }

  draw(g) {
    super.draw(g)
    g.beginPath()
    g.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
    g.closePath()
    this.fill && g.fill()
    this.stroke && g.stroke()
  }
}

