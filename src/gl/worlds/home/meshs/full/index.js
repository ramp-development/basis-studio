import App from "@app";
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
import VideoLoader from "@modules/VideoLoader.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const app = App.getInstance();
let glInstance = null;

export default class index {
  constructor(gl, scene, main) {
    glInstance = gl;
    this.scene = scene;
    this.main = main;

    this.sizes = app.sizes;
    this.time = app.time;

    this.items = this.main.querySelectorAll(".full_item");

    this.init();
  }

  init() {
    this.setMaterial();
    this.setMesh();
    // this.debug()
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
        uReveal: new Uniform(0),
        uRotate: new Uniform(0),
        uRotateX: new Uniform(0),
        uRotateY: new Uniform(0),
        uRadius: new Uniform(0.02),
        uZoom: new Uniform(0.55),
        uTime: new Uniform(0),
        uFluid: new Uniform(null),
        uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
      },
    });
  }

  setMesh() {
    this.meshs = [...this.items].map((item, index) => {
      const rect = item.getBoundingClientRect();
      const geometry = new PlaneGeometry(rect.width, rect.height, 1, 1);
      const material = this.material.clone();
      material.uniforms.uSize.value.set(rect.width, rect.height);
      material.uniforms.uTexture.value = glInstance.gradientTexture;
      const mesh = new Mesh(geometry, material);

      const video = item.querySelector("video");
      if (video) {
        // Use existing VideoLoader instance if available (from data-module)
        if (video._videoLoaderInstance) {
          const videoLoader = video._videoLoaderInstance;
          if (videoLoader.isLoaded) {
            const texture = new VideoTexture(video);
            material.uniforms.uTexture.value = texture;
            material.uniforms.uAspect.value.set(
              videoLoader.width || video.videoWidth,
              videoLoader.height || video.videoHeight
            );
          } else {
            videoLoader.on("loaded", () => {
              const texture = new VideoTexture(video);
              material.uniforms.uTexture.value = texture;
              material.uniforms.uAspect.value.set(
                videoLoader.width,
                videoLoader.height
              );
            });
          }
        } else {
          // Fallback: create VideoLoader if module doesn't exist
          const videoLoader = new VideoLoader(video, { lazyLoad: false });
          videoLoader.on("loaded", () => {
            const texture = new VideoTexture(video);
            material.uniforms.uTexture.value = texture;
            material.uniforms.uAspect.value.set(
              videoLoader.width,
              videoLoader.height
            );
          });
        }
      }

      mesh.renderOrder = index;

      this.scene.add(mesh);

      app.observer.instance.observe(item);

      // OLD ANIMATION - commented for easy rollback
      // const tl = gsap.timeline({
      //   paused: true,
      //   defaults: { duration: 1, ease: "power2.in" },
      // });
      // tl.to(material.uniforms.uReveal, { value: 1.55 })
      //   .fromTo(
      //     material.uniforms.uRotate,
      //     { value: -0.2 },
      //     { value: Math.PI / 3 },
      //     "<"
      //   )
      //   .to(material.uniforms.uRotateX, { value: 0.7, duration: 0.3 }, "<")
      //   .fromTo(
      //     material.uniforms.uRadius,
      //     { value: 0 },
      //     { value: 0.02, duration: 0.2 },
      //     "<"
      //   )
      //   .to(material.uniforms.uRotateY, { value: -0.3, duration: 0.3 }, "<0.2");

      // NEW ANIMATION - same as video entering effect
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 1, ease: "power3.out" },
      });
      tl.to(material.uniforms.uReveal, { value: 1 })
        .fromTo(material.uniforms.uRotate, { value: -0.3 }, { value: 0 }, "<")
        .fromTo(material.uniforms.uRotateY, { value: 0.8 }, { value: 0 }, "<")
        .fromTo(material.uniforms.uRotateX, { value: -0.8 }, { value: 0 }, "<");

      return { mesh, item, material, tl };
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
    });
  }

  update() {
    this.meshs.forEach(({ mesh, material }) => {
      material.uniforms.uFluid.value = glInstance.fluidTexture;
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
