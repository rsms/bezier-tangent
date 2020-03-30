import { Node } from "./index"

export class GroupNode extends Node {
  constructor(position, children) {
    super(position)
    this.children = new Set(children)
  }

  add(n) {
    if (n.parent) {
      n.parent.remove(n)
    }
    this.children.add(n)
    n.parent = this
    return n
  }

  remove(n) {
    if (this.children.delete(n)) {
      n.parent = null
    }
  }

  updateAndDraw(g, time) {
    if (!this.visible) {
      return
    }
    if (this.needsRecompute) {
      this.recompute()
    }
    let prevtr = g.getTransform()
    g.translate(this.position.x, this.position.y)
    this.update(time, g)
    for (let n of this.children) {
      n.updateAndDraw(g, time)
    }
    g.setTransform(prevtr)
  }

  pointFromSceneSpace(p) {
    return p.sub(this.position)
  }

  hitTest(p) {
    p = p.sub(this.position)
    for (let n of this.children) {
      let ev = n.hitTest(p)
      if (ev) {
        return ev
      }
    }
    return null
  }
}
