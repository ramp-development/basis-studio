import {
  Uniform,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  VideoTexture,
  Color,
} from "three";
import { UpdateGeometry } from "@gl/UpdateGeometry.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

export default class index {
  constructor(app, gl, scene, main, resources, videoTextures, items) {
    this.app = app;
    this.gl = gl;
    this.scene = scene;
    this.main = main;
    this.resources = resources;
    this.videoTextures = videoTextures;
    this.items = items;

    this.sizes = this.app.sizes;
    this.time = this.app.time;
    this.velocity = { value: 0 };
    this.quick = gsap.quickTo(this.velocity, "value", {
      duration: 0.5,
      ease: "power2",
    });

    this.init();
  }

  init() {
    this.setMaterial();
    this.setMesh();
    this.debug();
  }

  debug() {
    if (!this.app.debug.active) return;

    const gui = this.app.debug.gui;
    const folder = gui.addFolder("Home/Video");

    folder
      .add(this.material.uniforms.uReveal, "value", 0, 1, 0.01)
      .name("uReveal")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uReveal.value = value)
        );
      });

    folder
      .add(this.material.uniforms.uRotate, "value", 0, 2, 0.01)
      .name("uRotate")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotate.value = value)
        );
      });

    folder
      .add(this.material.uniforms.uRadius, "value", 0, 1, 0.01)
      .name("uRadius")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRadius.value = value)
        );
      });

    folder
      .add(this.material.uniforms.uRotateX, "value", -1, 1, 0.01)
      .name("uRotateX")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotateX.value = value)
        );
      });

    folder
      .add(this.material.uniforms.uRotateY, "value", -1, 1, 0.01)
      .name("uRotateY")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotateY.value = value)
        );
      });

    folder
      .add(this.material.uniforms.uZoom, "value", -1, 1, 0.01)
      .name("uZoom")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uZoom.value = value)
        );
      });
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTexture: new Uniform(null),
        uRes: new Uniform(new Vector2(this.sizes.width, this.sizes.height)),
        uAspect: new Uniform(new Vector2(16, 9)),
        uSize: new Uniform(new Vector2(0, 0)),
        uBorder: new Uniform(0),
        uReveal: new Uniform(0),
        uRotate: new Uniform(0),
        uRotateX: new Uniform(0),
        uRotateY: new Uniform(0),
        uRadius: new Uniform(0.02),
        uZoom: new Uniform(0.55),
        uLoading: new Uniform(0),
        uTime: new Uniform(0),
        uFluid: new Uniform(null),
        uOffset: new Uniform(null),
        uParallax: new Uniform(0),
        uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
      },
    });
  }

  setMesh() {
    this.meshs = [...this.items].map((item, index) => {
      const roots = window
        .getComputedStyle(item)
        .getPropertyValue("border-radius")
        .split("px");
      const nameEl = item.querySelector(".f-28");
      const name = nameEl
        ? nameEl.textContent.trim() || `case-${index}`
        : `case-${index}`;
      const videoParent = item.querySelector(".cases_video_wrapper");

      let texture = null;
      let width = 0;
      let height = 0;

      if (!videoParent.classList.contains("w-condition-invisible")) {
        const currentEl = this.videoTextures.find(
          (video) => video.name === name
        );
        texture = currentEl.texture;
        width = currentEl.width;
        height = currentEl.height;
      } else {
        texture = this.resources[name];
        const newImage = new Image();
        newImage.src = item.querySelector("img").getAttribute("src");

        newImage.onload = () => {
          material.uniforms.uAspect.value.set(newImage.width, newImage.height);
        };
      }

      const rect = item.getBoundingClientRect();
      const geometry = new PlaneGeometry(rect.width, rect.height, 200, 200);
      const material = this.material.clone();
      material.uniforms.uSize.value.set(rect.width, rect.height);
      material.uniforms.uTexture.value = texture;
      material.uniforms.uBorder.value = parseFloat(roots[0]);
      material.uniforms.uAspect.value.set(width, height);
      const mesh = new Mesh(geometry, material);

      this.scene.add(mesh);

      return { mesh, item, material };
    });

    this.setPosition(null);
  }

  setPosition(e) {
    this.meshs.forEach(({ mesh, item }) => {
      if (item.dataset.visible == "false") {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;

      const rect = item.getBoundingClientRect();
      mesh.position.x = rect.left + rect.width / 2 - this.sizes.width / 2;
      mesh.position.y = -rect.top - rect.height / 2 + this.sizes.height / 2;
    });

    if (e) {
      this.quick(-e.velocity * 1.5);
      this.meshs.forEach(
        ({ material }) =>
          (material.uniforms.uOffset.value = this.velocity.value)
      );
    }
  }

  resize() {
    this.meshs.forEach(({ mesh, item }) => {
      const rect = item.getBoundingClientRect();
      UpdateGeometry(
        mesh,
        new PlaneGeometry(rect.width, rect.height, 200, 200)
      );
      mesh.material.uniforms.uSize.value.set(rect.width, rect.height);

      const roots = window
        .getComputedStyle(item)
        .getPropertyValue("border-radius")
        .split("px");
      mesh.material.uniforms.uBorder.value = parseFloat(roots[0]);
    });
  }

  update() {
    if (this.destroyed) return;

    this.meshs.forEach(({ mesh, material }) => {
      material.uniforms.uFluid.value = this.gl.fluidTexture;
    });
  }

  destroy() {
    this.meshs.forEach(({ mesh, material }) => {
      material.dispose();
      mesh.geometry.dispose();
      this.scene.remove(mesh);

      this.destroyed = true;
    });
  }
}
