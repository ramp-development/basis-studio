import {
  WebGLRenderTarget,
  Box3,
  VideoTexture,
  TorusKnotGeometry,
} from "three";
import Resources from "@utils/Resources";
import gsap from "gsap";
import VideoLoader from "@utils/VideoLoader.js";

import Items from "./meshs/items/index.js";

export default class World {
  constructor(gl, app, scene, main) {
    this.gl = gl;
    this.app = app;
    this.scene = scene;
    this.main = main;

    this.sizes = this.app.sizes;
    this.renderer = this.gl.renderer.instance;
    this.camera = this.gl.camera.instance;
    this.scene = scene;

    this.load();
  }

  load() {
    this.videosLength = this.main.querySelectorAll(
      ".cases_video_wrapper:not(.w-condition-invisible"
    ).length;
    this.videoTexetures = [];
    this.count = 0;
    this.videoLoaded = false;
    this.itemElements = this.main.querySelectorAll(".cases_item");
    this.sources = [...this.itemElements]
      .map((item) => {
        const name = item.querySelector(".f-28").textContent.trim();
        const image = item.querySelector("img");

        if (image.classList.contains("w-condition-invisible")) return null;
        const url = image.getAttribute("src");

        return { type: "textureLoader", url, name: name };
      })
      .filter(Boolean);

    this.resources = new Resources(this.sources);

    this.itemElements.forEach((item) => {
      const name = item.querySelector(".f-28").textContent.trim();
      const videoParent = item.querySelector(".cases_video_wrapper");

      if (videoParent.classList.contains("w-condition-invisible")) return;
      const video = videoParent.querySelector("video");
      
      // Use existing VideoLoader instance if available (from data-module)
      if (video._videoLoaderInstance) {
        const videoLoader = video._videoLoaderInstance;
        if (videoLoader.isLoaded) {
          const texture = new VideoTexture(video);
          this.videoTexetures.push({
            name,
            texture,
            width: videoLoader.width || video.videoWidth,
            height: videoLoader.height || video.videoHeight,
          });
          this.checkLoaded();
        } else {
          videoLoader.on("loaded", () => {
            const texture = new VideoTexture(video);
            this.videoTexetures.push({
              name,
              texture,
              width: videoLoader.width,
              height: videoLoader.height,
            });
            this.checkLoaded();
          });
        }
      } else {
        // Fallback: create VideoLoader if module doesn't exist
        const videoLoader = new VideoLoader(video, { lazyLoad: false });
        videoLoader.on("loaded", () => {
          const texture = new VideoTexture(video);
          this.videoTexetures.push({
            name,
            texture,
            width: videoLoader.width,
            height: videoLoader.height,
          });
          this.checkLoaded();
        });
      }
    });

    this.resources.on("ready", () => this.checkLoaded());
  }

  checkLoaded() {
    this.count++;
    if (this.count == this.videosLength + 1) {
      this.init();
    }
  }

  init() {
    this.gl.loaded = true;

    this.items = new Items(
      this.app,
      this.gl,
      this.scene,
      this.main,
      this.resources.items,
      this.videoTexetures,
      this.itemElements
    );

    this.app.trigger("loadedWorld");

    if (!this.app.onceLoaded) {
      this.app.globalLoader.tl.play();
      this.app.page.triggerLoad();
    }
    // else this.app.enterPage.tl.play()
  }

  setScroll(e) {
    this.items?.setPosition(e);
  }

  update() {
    this.items?.update();
  }

  createTexture(target) {
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    return target.texture;
  }

  resize() {
    this.items?.resize();
  }

  onMouseMove(e, mouse) {}

  destroy() {
    this.items?.destroy();
  }
}
