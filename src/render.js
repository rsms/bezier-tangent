export class Renderer extends EventEmitter {
  constructor() {
    super()
    this.canvas = $('canvas')
    this.g = this.canvas.getContext('2d')
    this.scale = 1
    this.updateScale()
    this.resizeCanvasToWindow()
    this._onWindowResize = () => {
      this.updateScale()
      this.resizeCanvasToWindow()
      this.dispatchEvent("resize")
    }
    window.addEventListener("resize", this._onWindowResize)
  }

  finalize() {
    window.removeEventListener("resize", this._onWindowResize)
  }

  updateScale() {
    this.scale = (window.devicePixelRatio || 1) / (
      this.g.backingStorePixelRatio ||
      this.g.webkitBackingStorePixelRatio ||
      this.g.mozBackingStorePixelRatio ||
      this.g.msBackingStorePixelRatio ||
      this.g.oBackingStorePixelRatio ||
      1
    )
  }

  resizeCanvasToWindow() {
    // this.resizeCanvas(window.innerWidth, window.innerWidth * (3/4))
    this.resizeCanvas(window.innerWidth, window.innerWidth)
  }

  resizeCanvas(width, height) {
    this.canvas.style.zoom = String(1 / this.scale)
    this.canvas.width = width * this.scale
    this.canvas.height = height * this.scale
  }

  render(scene, time) {
    const g = this.g
    g.setTransform(this.scale, 0, 0, this.scale, 0, 0)
    if (scene.transform) {
      g.transform(scene.transform)
    }
    scene.updateAndDraw(g, time)
  }
}
