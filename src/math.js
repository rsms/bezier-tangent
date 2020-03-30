export function rad2deg(radians) {
  return radians * (180 / Math.PI)
}

export function deg2rad(degrees) {
  return degrees * (Math.PI / 180)
}


export class Rect {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  containsPoint(v) {
    return (
      v.x >= this.x && v.x <= this.x + this.width &&
      v.y >= this.y && v.y <= this.y + this.width
    )
  }

  translate(v) {
    return new Rect(this.x + v.x, this.y + v.y, this.width, this.height)
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.width}, ${this.height})`
  }
}


export class Vec /*extends Array*/ {
  constructor(x, y) {
    // super(x, y)
    this.x = x
    this.y = y
  }

  distanceTo(v) { // euclidean distance between this and v
    return Math.sqrt(this.squaredDistanceTo(v))
  }

  squaredDistanceTo(v){
    let x = this.x - v.x
    let y = this.y - v.y
    return x * x + y * y
  }

  angleTo(v) { // angle from this to v in radians
    return Math.atan2(this.y - v.y, this.x - v.x) + Math.PI
  }

  // LERP - Linear intERPolation between this and v
  lerp(v, t) {
    let a = this, ax = a.x, ay = a.y
    return vec(ax + t * (v.x - ax), ay + t * (v.y - ay))
  }

  isInside(vmin, vmax) {
    return v.x >= vmin.x && v.x <= vmax.x && v.y >= vmin.y && v.y <= vmax.y
  }

  copy() {
    return new Vec(this.x, this.y)
  }

  sub(v) {
    return (typeof v == "number" ?
      new Vec(this.x - v, this.y - v) :
      new Vec(this.x - v.x, this.y - v.y) )
  }
  add(v) {
    return (typeof v == "number" ?
      new Vec(this.x + v, this.y + v) :
      new Vec(this.x + v.x, this.y + v.y) )
  }
  mul(v) {
    return (typeof v == "number" ?
      new Vec(this.x * v, this.y * v) :
      new Vec(this.x * v.x, this.y * v.y) )
  }
  div(v) {
    return (typeof v == "number" ?
      new Vec(this.x / v, this.y / v) :
      new Vec(this.x / v.x, this.y / v.y) )
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}

export function vec(x, y) {
  return new Vec(x, y)
}
