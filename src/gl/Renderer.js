import App from "@app";
import { WebGLRenderer, ACESFilmicToneMapping } from "three";
import { isSafari } from "@utils/isSafari";

const app = App.getInstance();

export default class Renderer {
  constructor(gl) {
    this.gl = gl;
    this.canvas = this.gl.canvas;
    this.sizes = app.sizes;
    this.scene = this.gl.scene;
    this.camera = this.gl.camera.instance;

    this.setInstance();
  }

  setInstance() {
    // Optimize for Safari
    const isMobile = window.innerWidth < 992;

    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !isSafari || !isMobile, // Disable antialiasing on Safari mobile
      powerPreference: isSafari ? "high-performance" : "default",
      stencil: false,
      depth: true,
    });
    this.instance.setSize(this.sizes.width, this.sizes.height);
    // Limit pixel ratio on Safari for better performance
    const maxPixelRatio = isSafari ? 1 : 2;
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, maxPixelRatio));
    this.instance.render(this.scene, this.camera);
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.shadowMap.enabled = true;
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
  }

  update() {
    this.instance.render(this.scene, this.camera);
  }
}
