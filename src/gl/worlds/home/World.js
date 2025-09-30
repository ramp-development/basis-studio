import App from "@app";
import Resources from "@utils/Resources";
import FluidMask from "@gl/utils/fluidMask/index.js";

import Hero from "./meshs/hero/index.js";
import Video from "./meshs/video/index.js";
import Full from "./meshs/full/index.js";

const app = App.getInstance();
let glInstance = null;

export default class World {
  constructor(gl, scene, main) {
    glInstance = gl;
    this.scene = scene;
    this.main = main;

    this.sizes = app.sizes;
    this.renderer = glInstance.renderer.instance;
    this.camera = glInstance.camera.instance;
    this.scene = scene;

    this.load();
  }

  load() {
    this.count = 0;
    this.items = this.main.querySelectorAll(".hero_image, .hero_video");
    this.footerLogo = this.main.querySelector(".footer_logo");
    this.nowText = this.main.querySelector(".now_texture");
    this.testimonials = this.main.querySelector(".testimonials");

    this.sources = [...this.items]
      .filter((item) => item.querySelector("img")) // Only process items with images
      .map((item, index) => {
        const image = item.querySelector("img");
        const url = image.getAttribute("src");

        return { type: "textureLoader", url, name: index };
      });

    if (this.footerLogo) {
      const textures = this.getTextureAttributes(this.footerLogo);
      textures.forEach(({ value }, index) => {
        this.sources.push({
          type: "textureLoader",
          url: value,
          name: `footer-${index}`,
        });
      });
      gsap.set(this.footerLogo, { opacity: 0 });
    }

    if (this.nowText) {
      const textures = this.getTextureAttributes(this.nowText);
      textures.forEach(({ value }, index) => {
        this.sources.push({
          type: "textureLoader",
          url: value,
          name: `nowText-${index}`,
        });
      });
    }

    this.resources = new Resources(this.sources);
    this.resources.on("ready", () => this.init());
  }

  init() {
    glInstance.loaded = true;

    this.video = new Video(glInstance, this.scene, this.main);
    this.full = new Full(glInstance, this.scene, this.main);
    this.hero = new Hero(glInstance, this.scene, this.main, this.resources);

    if (this.footerLogo) {
      this.footerMeshs = [];
      const textures = this.getTextureAttributes(this.footerLogo);
      this.footerTextures = textures.map((_, index) => {
        const name = `footer-${index}`;
        return this.resources.items[name];
      });
      this.footerTextures.forEach((texture, index) => {
        this.footerMeshs[index] = new FluidMask(
          glInstance,
          this.scene,
          this.footerLogo,
          texture,
          index
        );
      });
    }

    if (this.nowText) {
      this.nowMeshs = [];
      const textures = this.getTextureAttributes(this.nowText);
      this.nowTextTextures = textures.map((_, index) => {
        const name = `nowText-${index}`;
        return this.resources.items[name];
      });
      this.nowTextTextures.forEach((texture, index) => {
        this.nowMeshs[index] = new FluidMask(
          glInstance,
          this.scene,
          this.nowText,
          texture,
          index
        );
      });
    }

    app.trigger("loadedWorld");

    if (!app.onceLoaded) {
      app.globalLoader.tl.play();
      app.page.triggerLoad();
    }
  }

  setScroll(e) {
    this.video?.setPosition();
    this.full?.setPosition();
    this.hero?.setPosition();
    this.footerMeshs?.forEach((mesh) => mesh.setPosition());
    this.nowMeshs?.forEach((mesh) => mesh.setPosition());
    // COMMENTED OUT - Removing 3D testimonials for testing
    // this.testimonialsMesh?.setPosition();
  }

  update() {
    this.video?.update();
    this.full?.update();
    this.hero?.update();
    this.footerMeshs?.forEach((mesh) => mesh.update());
    this.nowMeshs?.forEach((mesh) => mesh.update());
    // COMMENTED OUT - Removing 3D testimonials for testing
    // this.testimonialsMesh?.update();
  }

  createTexture(target) {
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    return target.texture;
  }

  resize() {
    this.video?.resize();
    this.full?.resize();
    this.hero?.resize();
    this.footerMeshs?.forEach((mesh) => mesh.resize());
    this.nowMeshs?.forEach((mesh) => mesh.resize());
    // COMMENTED OUT - Removing 3D testimonials for testing
    // this.testimonialsMesh?.resize();
  }

  onMouseMove(e, mouse) {
    this.hero?.onMouseMove(e, mouse);
  }

  destroy() {
    this.video?.destroy();
    this.full?.destroy();
    this.hero?.destroy();
    this.footerMeshs?.forEach((mesh) => mesh.destroy());
    this.nowMeshs?.forEach((mesh) => mesh.destroy());
  }

  getTextureAttributes(element) {
    return element
      .getAttributeNames()
      .filter((name) => name.startsWith("data-texture-"))
      .map((name) => ({
        name: name,
        value: element.getAttribute(name),
        number: parseInt(name.split("-")[2]), // Extract the number
      }))
      .sort((a, b) => a.number - b.number); // Sort by number
  }
}
