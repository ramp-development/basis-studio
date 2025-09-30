import App from "@app";
import { VideoTexture } from "three";
import Resources from "@utils/Resources";
import VideoLoader from "@modules/VideoLoader.js";

import Items from "./meshs/items/index.js";

const app = App.getInstance();

export default class World {
  constructor(gl, oldApp, scene, main) {
    this.gl = gl;
    this.scene = scene;
    this.main = main;

    this.sizes = app.sizes;
    this.renderer = this.gl.renderer.instance;
    this.camera = this.gl.camera.instance;
    this.scene = scene;

    this.load();
  }

  load() {
    this.videosLength = this.main.querySelectorAll(
      ".cases_video_wrapper:not(.w-condition-invisible)"
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

    // Track how many videos need loading
    this.videosToLoadCount = 0;

    this.itemElements.forEach((item) => {
      const name = item.querySelector(".f-28").textContent.trim();
      const videoParent = item.querySelector(".cases_video_wrapper");
      if (!videoParent) return;

      if (videoParent.classList.contains("w-condition-invisible")) return;

      const video = videoParent.querySelector("video");
      if (!video) return;

      this.videosToLoadCount += 1;

      // Check if video element is already loaded/playing
      const isVideoReady =
        video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;

      // Use existing VideoLoader instance if available (from data-module)
      if (video._videoLoaderInstance) {
        const videoLoader = video._videoLoaderInstance;

        // If video is ready, use it immediately regardless of VideoLoader state
        if (isVideoReady || videoLoader.isLoaded) {
          const texture = new VideoTexture(video);
          this.videoTexetures.push({
            name,
            texture,
            width: videoLoader.width || video.videoWidth,
            height: videoLoader.height || video.videoHeight,
          });
          this.checkLoaded();
        } else {
          // Call VideoLoader's startLoading method
          if (videoLoader.startLoading) {
            videoLoader.startLoading();
          }

          // Listen for the loaded event
          videoLoader.once("loaded", () => {
            const texture = new VideoTexture(video);
            this.videoTexetures.push({
              name,
              texture,
              width: videoLoader.width || video.videoWidth,
              height: videoLoader.height || video.videoHeight,
            });
            this.checkLoaded();
          });

          // Also set a timeout fallback in case the event doesn't fire
          setTimeout(() => {
            if (
              !videoLoader.isLoaded &&
              video.readyState >= 2 &&
              video.videoWidth > 0
            ) {
              const texture = new VideoTexture(video);
              this.videoTexetures.push({
                name,
                texture,
                width: video.videoWidth,
                height: video.videoHeight,
              });
              this.checkLoaded();
            } else if (!videoLoader.isLoaded) {
              console.error(
                `[Cases World] Video "${name}" failed to load, counting anyway`
              );
              this.checkLoaded();
            }
          }, 5000);
        }
      } else {
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
    this.count += 1;
    // Check if all resources are loaded (videos + image resources)
    // We need to wait for all videos and the resources.on("ready") event
    // Updated the count to match actual videosToLoad not videosLength
    if (this.count >= this.videosToLoadCount + 1) {
      this.init();
    }
  }

  init() {
    this.gl.loaded = true;

    this.items = new Items(
      app,
      this.gl,
      this.scene,
      this.main,
      this.resources.items,
      this.videoTexetures,
      this.itemElements
    );

    app.trigger("loadedWorld");

    if (!app.onceLoaded) {
      app.globalLoader.tl.play();
      app.page.triggerLoad();
    }
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
