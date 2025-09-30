import App from "@app";
import { PerspectiveCamera } from "three";

const app = App.getInstance();

export default class Camera {
  constructor(gl, scene) {
    this.sizes = app.sizes;
    this.scene = scene;
    this.canvas = gl.canvas;

    this.setInstance();
    // this.orbitControls()
  }

  setInstance() {
    this.fovNum = 1200;

    this.fov =
      Math.atan(this.sizes.height / 2 / this.fovNum) * 2 * (180 / Math.PI);
    this.instance = new PerspectiveCamera(
      this.fov,
      this.sizes.width / this.sizes.height,
      1,
      2000
    );
    this.instance.position.z = this.fovNum;
    this.instance.frustumCulled = true;

    this.scene.add(this.instance);
  }

  resize() {
    this.fov =
      Math.atan(this.sizes.height / 2 / this.fovNum) * 2 * (180 / Math.PI);
    this.instance.fov = this.fov;

    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  orbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  update() {}
}
