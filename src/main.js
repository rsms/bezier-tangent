import "./global"
import { Scene } from "./scene"
import { Renderer } from "./render"
import { vec } from "./math"
import { GroupNode, LineNode, DiscNode, CubicBezierNode, Stroke } from "./node"

function setupScene(scene, renderer) {
  let g = new GroupNode(vec(100,200))

  let curve1 = g.add(new CubicBezierNode(
    vec(250, 120),  // start
    vec(290, -40),  // control 1
    vec(300, 200),  // control 2
    vec(400, 150),  // end
    new Stroke("rgba(0,0,0,0.4)", 1.5)
  ))

  // show bezier control points
  let handleSize = 4
  let c1Line = g.add(new LineNode(curve1.c1, curve1.position, "rgba(0,0,0,0.1)"))
  let c2Line = g.add(new LineNode(curve1.c2, curve1.end, "rgba(0,0,0,0.1)"))
  let curveStart = g.add(new DiscNode(curve1.position, handleSize, "white", "rgba(0,30,200,0.5)"))
  let curveEnd = g.add(new DiscNode(curve1.end, handleSize, "white", "rgba(0,30,200,0.5)"))
  let c1 = g.add(new DiscNode(curve1.c1, handleSize, "white", "rgba(0,180,20,0.8)"))
  let c2 = g.add(new DiscNode(curve1.c2, handleSize, "white", "rgba(0,180,20,0.8)"))
  function makeDraggable(n) {
    let origFill = n.fill
    const movePoint = movementDelta => {
      let p = pointerDot.pointFromSceneSpace(scene.pointer)
      n.position.x = p.x
      n.position.y = p.y
      n.dirty()
      c1Line.dirty()
      c2Line.dirty()
      curve1.dirty()
    }
    n.on("pointerdown", ev => {
      n.fill = "rgba(0,180,20,0.8)"
      scene.on("pointermove", movePoint)
    })
    n.on("pointerup", ev => {
      n.fill = origFill
      scene.off("pointermove", movePoint)
    })
  }
  makeDraggable(curveStart)
  makeDraggable(curveEnd)
  makeDraggable(c1)
  makeDraggable(c2)

  // pointer
  let pointerp = vec(-1000,-1000)
  let pointerPerimeter = g.add(new DiscNode(pointerp, 8, null, "rgba(0,200,255,0.2)"))
  let pointerDot = g.add(new DiscNode(pointerp, 8, "rgba(0,200,255,0.3)"))
  let pointerTangentLine = g.add(new LineNode(null, null, "rgba(255,50,0,0.9)"))
  let pointerNormalLine = g.add(new LineNode(null, null, "rgba(0,100,255,0.9)"))
  let pointerDotRay = g.add(new DiscNode(pointerp, 3, "rgba(0,200,255,1)"))

  const pointerUpdate = movementDelta => {
    pointerDot.position = pointerDot.pointFromSceneSpace(scene.pointer)

    let [p1, t] = curve1.closestPoint(pointerDot.position)
    pointerDotRay.position = p1

    let d = pointerDot.position.distanceTo(pointerDotRay.position)

    let p2 = p1.add(curve1.tangentAt(t))
    pointerTangentLine.position = p1
    pointerTangentLine.end = p2
    pointerTangentLine.length = Math.max(40, d)  // adjust line to be fixed size

    pointerNormalLine.position = p1
    pointerNormalLine.end = p2
    pointerNormalLine.rotate(90)
    pointerNormalLine.length = Math.max(40, d)

    pointerPerimeter.position = pointerDot.position
    pointerPerimeter.radius = Math.max(pointerDot.radius, d)
    pointerPerimeter.stroke.color = `rgba(0,200,255,${Math.max(0.1,20/d)})`
  }
  scene.on("pointermove", pointerUpdate)
  scene.on("pointerleave", () => {
    scene.removeEventListener("pointermove", pointerUpdate)
    pointerDotRay.visible = false
    pointerDot.visible = false
    pointerPerimeter.visible = false
    pointerTangentLine.visible = false
    pointerNormalLine.visible = false
  })
  scene.on("pointerenter", () => {
    scene.addEventListener("pointermove", pointerUpdate)
    pointerDotRay.visible = true
    pointerDot.visible = true
    pointerPerimeter.visible = true
    pointerTangentLine.visible = true
    pointerNormalLine.visible = true
  })

  // animated tangent & normal lines
  let tangentLine = g.add(new LineNode(null, null, "rgba(255,50,0,0.9)"))
  let normalLine = g.add(new LineNode(null, null, "rgba(0,100,255,0.9)"))
  let dot = g.add(new DiscNode(null, 2, "black"))
  tangentLine.update = time => {
    let t = Math.abs(1 - (time % 4000) / 2000)
    dot.position = curve1.pointAt(t)

    let p1 = curve1.pointAt(t)

    let vel = curve1.tangentAt(t)
    let p2 = p1.add(vel.mul(/* reduce length */0.3))
    tangentLine.position = p1
    tangentLine.end = p2

    normalLine.position = p1
    normalLine.end = p2
    normalLine.rotate(90)
  }

  scene.add(g)
  scene.enableHitTesting()

  // center group in scene
  // scene.
}


function main() {
  log("start")
  let renderer = new Renderer()
  let scene = new Scene(renderer)
  setupScene(scene)

  let animate = true

  function tick(time) {
    renderer.render(scene, time)
    if (animate) {
      requestAnimationFrame(tick)
    }
  }

  if (animate) {
    requestAnimationFrame(tick)
  } else {
    tick(1200)
  }
}

// window.addEventListener('DOMContentLoaded', main)
main()
