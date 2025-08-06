import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export default class Fade {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    if (window.innerWidth > 992) return;

    this.tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2", duration: 0.8 },
    });

    this.tl.fromTo(
      this.instance,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0 }
    );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top 85%",

      onEnter: () => this.tl.play(),
    });

    this.scrollBack = ScrollTrigger.create({
      trigger: this.instance,
      start: "top bottom",
      onLeaveBack: () => this.tl.pause(0),
    });
  }

  resize() {
    if (this.destroyed) return;

    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
