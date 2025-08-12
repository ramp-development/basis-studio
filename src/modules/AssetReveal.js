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
    gsap.set(this.instance.parentElement, {
      perspective: 1000,
      perspectiveOrigin: "center center",
    });

    gsap.set(this.instance, {
      transformOrigin: "center center",
      transformStyle: "preserve-3d",
    });

    this.tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out", duration: 1 },
    });

    // Mimic the 3D GL reveal effect in 2D
    this.tl.fromTo(
      this.instance,
      {
        autoAlpha: 0,
        rotationZ: -18, // equivalent to uRotate: -0.3
        rotationY: 45, // equivalent to uRotateY: 0.8
        rotationX: -45, // equivalent to uRotateX: -0.8
        scale: 0.4,
      },
      {
        autoAlpha: 1,
        rotationZ: 0,
        rotationY: 0,
        rotationX: 0,
        scale: 1,
      }
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
