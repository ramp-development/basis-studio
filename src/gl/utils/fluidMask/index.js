import {
  Uniform,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Color,
} from "three";
import { UpdateGeometry } from "@gl/UpdateGeometry.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

export default class index {
  constructor(app, gl, scene, item, texture, index) {
    this.app = app;
    this.gl = gl;
    this.scene = scene;
    this.item = item;
    this.texture = texture;
    this.index = index;

    this.sizes = this.app.sizes;
    this.time = this.app.time;

    this.init();
  }

  init() {
    this.setMaterial();
    this.setMesh();
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTexture: new Uniform(this.texture),
        uRes: new Uniform(new Vector2(this.sizes.width, this.sizes.height)),
        uAspect: new Uniform(new Vector2(16, 9)),
        uSize: new Uniform(new Vector2(0, 0)),
        uFluid: new Uniform(null),
        uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
        uLoading: new Uniform(0),
        uTranslateY: new Uniform(1.2),
      },
    });
  }

  setMesh() {
    this.rect = this.item.getBoundingClientRect();
    this.geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
    this.material.uniforms.uSize.value.set(this.rect.width, this.rect.height);
    this.material.uniforms.uAspect.value.set(this.rect.width, this.rect.height);

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.renderOrder = 10;
    // this.mesh.rotation.y = -5 * Math.PI / 180
    this.mesh.rotation.x = -Math.PI / 2;
    // this.mesh.position.z = -10

    this.scene.add(this.mesh);

    this.setPosition();

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1.4, ease: "power2" },
    });

    tl.to(this.material.uniforms.uLoading, { value: 1 }, this.index * 0.3);
    tl.to(this.mesh.rotation, { y: 0, x: 0 }, this.index * 0.3);
    tl.to(this.mesh.position, { z: 0 }, this.index * 0.3);

    ScrollTrigger.create({
      trigger: this.item,
      start: "top 80%",
      onEnter: () => tl.restart(),
    });
  }

  setPosition() {
    this.rect = this.item.getBoundingClientRect();
    this.mesh.position.x =
      this.rect.left + this.rect.width / 2 - this.sizes.width / 2;
    this.mesh.position.y =
      -this.rect.top - this.rect.height / 2 + this.sizes.height / 2;
  }

  resize() {
    this.rect = this.item.getBoundingClientRect();
    UpdateGeometry(
      this.mesh,
      new PlaneGeometry(this.rect.width, this.rect.height, 1, 1)
    );
    this.mesh.material.uniforms.uSize.value.set(
      this.rect.width,
      this.rect.height
    );
  }

  update() {
    this.material.uniforms.uFluid.value = this.gl.fluidTexture;
  }

  destroy() {
    this.material.dispose();
    this.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}
