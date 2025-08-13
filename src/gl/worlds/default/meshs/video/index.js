import {
  Uniform,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  VideoTexture,
  Color,
} from "three";
import { gsap, ScrollTrigger } from "gsap/all";
import { UpdateGeometry } from "@gl/UpdateGeometry.js";
import VideoLoader from "@utils/VideoLoader.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

gsap.registerPlugin(ScrollTrigger);

export default class index {
  constructor(app, gl, scene, main) {
    this.app = app;
    this.gl = gl;
    this.scene = scene;
    this.main = main;

    this.sizes = this.app.sizes;
    this.time = this.app.time;

    this.items = this.main.querySelectorAll(".cases_video_study");

    this.init();
  }

  init() {
    this.setMaterial();
    this.setMesh();
    // this.debug();
  }

  debug() {
    if (!this.app.debug.active) return;

    const gui = this.app.debug.gui;
    this.folder = gui.addFolder("Home/Video");

    this.folder
      .add(this.material.uniforms.uReveal, "value", 0, 1, 0.01)
      .name("uReveal")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uReveal.value = value)
        );
      });

    this.folder
      .add(this.material.uniforms.uRotate, "value", 0, 2, 0.01)
      .name("uRotate")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotate.value = value)
        );
      });

    this.folder
      .add(this.material.uniforms.uRadius, "value", 0, 1, 0.01)
      .name("uRadius")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRadius.value = value)
        );
      });

    this.folder
      .add(this.material.uniforms.uRotateX, "value", -1, 1, 0.01)
      .name("uRotateX")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotateX.value = value)
        );
      });

    this.folder
      .add(this.material.uniforms.uRotateY, "value", -1, 1, 0.01)
      .name("uRotateY")
      .onChange((value) => {
        this.meshs.forEach(
          ({ material }) => (material.uniforms.uRotateY.value = value)
        );
      });

    this.folder
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
        uTime: new Uniform(0),
        uFluid: new Uniform(null),
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
      const rect = item.getBoundingClientRect();
      // Scale width and height independently
      const scaleX = 3.725; // Adjust width scaling
      const scaleY = 2.2; // Adjust height scaling
      const geometry = new PlaneGeometry(
        rect.width * scaleX,
        rect.height * scaleY,
        1,
        1
      );
      const material = this.material.clone();
      material.uniforms.uSize.value.set(rect.width, rect.height);
      // material.uniforms.uTexture.value = this.gl.gradientTexture
      material.uniforms.uBorder.value = parseFloat(roots[0]);
      const mesh = new Mesh(geometry, material);

      const video = item.querySelector("video");
      if (video) {
        const videoLoader = new VideoLoader(video);
        videoLoader.on("loaded", () => {
          const texture = new VideoTexture(video);
          material.uniforms.uTexture.value = texture;
          material.uniforms.uAspect.value.set(
            videoLoader.width,
            videoLoader.height
          );
        });
      }

      this.scene.add(mesh);

      this.app.observer.instance.observe(item);

      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 1, ease: "power3.out" },
      });

      // Different animation for talk_full vs other videos
      if (item.classList.contains("talk_full")) {
        // 3D scale + rotation animation for talk_full video
        mesh.scale.set(0.3, 0.3, 0.3); // Start small

        tl.to(material.uniforms.uReveal, { value: 1, duration: 0.1 }) // Quick fade in
          .to(
            mesh.scale,
            {
              x: 1,
              y: 1,
              z: 1,
              duration: 1.2,
              ease: "back.out(1.2)",
            },
            "<0.1"
          ) // Scale up with bounce
          .fromTo(
            material.uniforms.uRotate,
            { value: -0.3 },
            { value: 0 },
            "<0.1"
          )
          .fromTo(
            material.uniforms.uRotateY,
            { value: 0.8 },
            { value: 0 },
            "<0.1"
          )
          .fromTo(
            material.uniforms.uRotateX,
            { value: -0.8 },
            { value: 0 },
            "<0.1"
          )
          .fromTo(
            material.uniforms.uRadius,
            { value: 0 },
            { value: 0.02, duration: 0.2 },
            "<0.8"
          );
      } else {
        // Original rotation animation for other videos
        tl.to(material.uniforms.uReveal, { value: 1 })
          .fromTo(material.uniforms.uRotate, { value: -0.3 }, { value: 0 }, "<")
          .fromTo(material.uniforms.uRotateY, { value: 0.8 }, { value: 0 }, "<")
          .fromTo(
            material.uniforms.uRotateX,
            { value: -0.8 },
            { value: 0 },
            "<"
          )
          .fromTo(
            material.uniforms.uRadius,
            { value: 0 },
            { value: 0.02, duration: 0.2 },
            "<"
          );
      }
      // .to(material.uniforms.uRotateY, {value: -0.3, duration: 0.3}, '<0.2')
      // tl.to(material.uniforms.uReveal, {value: 1.55})
      // .fromTo(material.uniforms.uRotate, {value: -0.2}, {value: Math.PI / 3}, '<')
      // .to(material.uniforms.uRotateX, {value: 0.7, duration: 0.3}, '<')
      // .fromTo(material.uniforms.uRadius, {value: 0}, {value: 0.02, duration: 0.2}, '<')
      // .to(material.uniforms.uRotateY, {value: -0.3, duration: 0.3}, '<0.2')
      const value = { progress: 0 };

      // setTimeout(() =>
      // {
      //     this.folder.add(value, 'progress', 0, 1, 0.01).name(`Play ${index + 1}`).onChange(() => tl.progress(value.progress))
      // }, 100)

      ScrollTrigger.create({
        trigger: item,
        start: "top 90%",
        onEnter: () => tl.play(),
      });

      ScrollTrigger.create({
        trigger: item,
        start: "top bottom",
        onLeaveBack: () => tl.pause(0),
      });

      // Only apply parallax to .preview_img, not .talk_full
      if (item.classList.contains("preview_img")) {
        ScrollTrigger.create({
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const progress = self.progress;
            const remappedProgress = gsap.utils.mapRange(
              0,
              1,
              -0.2,
              0.2,
              progress
            );
            material.uniforms.uParallax.value = remappedProgress;
          },
        });
      }

      return { mesh, item, material };
    });

    this.setPosition();
  }

  setPosition() {
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
  }

  resize() {
    this.meshs.forEach(({ mesh, item }) => {
      const rect = item.getBoundingClientRect();
      UpdateGeometry(mesh, new PlaneGeometry(rect.width, rect.height, 1, 1));
      mesh.material.uniforms.uSize.value.set(rect.width, rect.height);

      const roots = window
        .getComputedStyle(item)
        .getPropertyValue("border-radius")
        .split("px");
      mesh.material.uniforms.uBorder.value = parseFloat(roots[0]);
    });
  }

  update() {
    this.meshs.forEach(({ material }) => {
      material.uniforms.uFluid.value = this.gl.fluidTexture;
      // material.uniforms.uTexture.value = this.gl.gradientTexture
    });
  }

  destroy() {
    this.meshs.forEach(({ mesh, material }) => {
      material.dispose();
      mesh.geometry.dispose();
      this.scene.remove(mesh);
    });
  }
}
