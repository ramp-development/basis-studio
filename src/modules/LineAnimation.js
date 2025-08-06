import { gsap, ScrollTrigger } from "@utils/GSAP.js";

export default class LineAnimation {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    // Simple animation without SplitText to avoid conflicts with LinkAnimation
    this.tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.8, ease: "power2.out" },
    });

    this.tl.fromTo(
      this.instance,
      {
        opacity: 0,
        y: 100,
      },
      {
        opacity: 1,
        y: 0,
      }
    );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top 95%",
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
