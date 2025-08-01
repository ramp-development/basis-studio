import { gsap, ScrollTrigger } from "@utils/GSAP.js";

export default class Hero {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    this.hero = this.main.querySelector(".hero");
    this.images = this.hero.querySelectorAll(".hero_image");

    this.destroyed = false;

    this.quicks = [...this.images].map((image, index) => {
      if (window.innerWidth < 992) return;

      const x = gsap.quickTo(image, "x", {
        duration: 0.5,
        ease: "power2",
        onUpdate: () => {
          if (index !== 0 || this.destroyed) return;

          this.app.gl.world.hero.setPosition();
        },
      });
      const y = gsap.quickTo(image, "y", { duration: 0.5, ease: "power2" });

      const random = gsap.utils.random(0.8, 1.2, 0.1);

      return { x, y, random };
    });

    this.main.addEventListener("mousemove", (e) => this.mouseMove(e));
    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  mouseMove(e) {
    if (this.destroyed) return;
    if (window.innerWidth < 992) return;

    const mouse = {
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    };
    const distanceX = window.innerWidth * 0.2;
    const distanceY = window.innerHeight * 0.15;

    this.quicks.forEach((quick) => {
      const x = mouse.x * distanceX * quick.random;
      const y = mouse.y * distanceY * quick.random;

      quick.x(x * -1);
      quick.y(y * -1);
    });
  }

  init() {}

  resize() {
    if (this.destroyed) return;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
