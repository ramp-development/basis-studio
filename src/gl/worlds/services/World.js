import { WebGLRenderTarget, Box3, VideoTexture } from "three";
import Resources from "@utils/Resources";
import FluidMask from "@gl/utils/fluidMask/index.js";
import gsap from "gsap";

import Hero from "./meshs/hero/index.js";

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
    this.hero = this.main.querySelector(".h-services");
    this.texture = this.hero
      .querySelector(".h-services_bg")
      .querySelector("img");
    this.footerLogo = this.main.querySelector(".footer_logo");

    this.sources = [
      {
        type: "textureLoader",
        url: this.texture.getAttribute("src"),
        name: "hero",
      },
    ];
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

    this.resources = new Resources(this.sources);

    this.resources.on("ready", () => this.init());
  }

  init() {
    this.gl.loaded = true;

    this.hero = new Hero(
      this.app,
      this.gl,
      this.scene,
      this.main,
      this.resources.items.hero,
      this.texture
    );

    if (this.footerLogo) {
      this.footerMeshs = [];
      const textures = this.getTextureAttributes(this.footerLogo);
      this.footerTextures = textures.map((_, index) => {
        const name = `footer-${index}`;
        return this.resources.items[name];
      });
      this.footerTextures.forEach((texture, index) => {
        this.footerMeshs[index] = new FluidMask(
          this.app,
          this.gl,
          this.scene,
          this.footerLogo,
          texture,
          index
        );
      });
    }

    this.app.trigger("loadedWorld");

    if (!this.app.onceLoaded) {
      this.app.globalLoader.tl.play();
      this.app.page.triggerLoad();
    }
  }

  setScroll(e) {
    this.hero?.setPosition(e);
    this.footerMeshs?.forEach((mesh) => mesh.setPosition());
  }

  update() {
    this.hero?.update();
    this.footerMeshs?.forEach((mesh) => mesh.update());
  }

  createTexture(target) {
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    return target.texture;
  }

  resize() {
    this.hero?.resize();
    this.footerMeshs?.forEach((mesh) => mesh.resize());
  }

  onMouseMove(e, mouse) {}

  destroy() {
    this.hero?.destroy();
    this.footerMeshs?.forEach((mesh) => mesh.destroy());
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
