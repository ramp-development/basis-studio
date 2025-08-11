import { gsap, ScrollTrigger } from "@utils/GSAP.js";
import { CSS } from "@utils/Easings.js";

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

    // Set up parent with perspective
    gsap.set(this.instance.parentElement, {
      overflow: "hidden",
      perspective: 1000,
      perspectiveOrigin: "center center",
    });

    // Set up the element with proper transform origin
    gsap.set(this.instance, {
      transformOrigin: "center bottom",
      transformStyle: "preserve-3d",
    });

    // Simple animation without SplitText to avoid conflicts with LinkAnimation
    this.tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.8, ease: CSS },
    });

    this.tl.fromTo(
      this.instance,
      {
        y: "120%",
        rotateX: "-90deg",
      },
      {
        y: "0%",
        rotateX: "0deg",
        stagger: 0.01,
      }
    );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: window.innerWidth > 992 ? "top 90%" : "top 95%",
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

    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();
  }
}
