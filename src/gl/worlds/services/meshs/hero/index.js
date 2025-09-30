import {
  Uniform,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  VideoTexture,
  Color,
} from "three";
import App from "@app";
import { UpdateGeometry } from "@gl/UpdateGeometry.js";
import VideoLoader from "@modules/VideoLoader.js";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const app = App.getInstance();

export default class index {
  constructor(oldApp, gl, scene, main, item) {
    this.gl = gl;
    this.scene = scene;
    this.main = main;
    this.item = item;

    this.sizes = app.sizes;
    this.time = app.time;

    this.rect = this.item.getBoundingClientRect();

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
        uScroll: new Uniform(0),
        uZoom: new Uniform(0.55),
        uTime: new Uniform(0),
        uFluid: new Uniform(null),
        uOffset: new Uniform(null),
        uParallax: new Uniform(0),
        uColor: new Uniform(new Color(255 / 255, 118 / 255, 162 / 255)),
      },
    });
  }

  setMesh() {
    this.geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
    this.mesh = new Mesh(this.geometry, this.material);
    this.material.uniforms.uSize.value.set(this.rect.width, this.rect.height);

    const video = this.item.querySelector("video");
    if (video) {
      this.setupVideoTexture(video);
    }

    this.scene.add(this.mesh);
    this.setPosition();
  }

  setupVideoTexture(video) {
    // Use existing VideoLoader instance if available (from data-module)
    if (video._videoLoaderInstance) {
      const videoLoader = video._videoLoaderInstance;

      if (videoLoader.isLoaded) {
        const texture = new VideoTexture(video);
        this.material.uniforms.uTexture.value = texture;
        this.material.uniforms.uAspect.value.set(
          videoLoader.width || video.videoWidth,
          videoLoader.height || video.videoHeight
        );
      } else {
        videoLoader.on("loaded", () => {
          const texture = new VideoTexture(video);
          this.material.uniforms.uTexture.value = texture;
          this.material.uniforms.uAspect.value.set(
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
        this.material.uniforms.uTexture.value = texture;
        this.material.uniforms.uAspect.value.set(
          videoLoader.width,
          videoLoader.height
        );
      });
    }
  }

  setPosition(e) {
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

    this.material.uniforms.uSize.value.set(this.rect.width, this.rect.height);
    this.material.uniforms.uRes.value.set(this.sizes.width, this.sizes.height);
  }

  update() {
    this.material.uniforms.uFluid.value = this.gl.fluidTexture;
  }

  destroy() {
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}
