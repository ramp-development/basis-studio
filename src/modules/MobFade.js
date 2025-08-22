import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export default class MobFade {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.init();

    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());

    console.log(this.instance, "MobFade instance");
  }

  init() {
    if (window.innerWidth > 992) return;

    // Set up 3D perspective like desktop version
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

    // Check if this is a .talk_full element for different scaling
    const isTalkFull = this.instance.classList.contains("talk_full");
    const startScale = isTalkFull ? 0.1 : 0.4;
    const endScale = isTalkFull ? 0.5 : 1;

    // Check if we're on cases page and this is one of the first two case items
    const isCasesPage =
      document.querySelector("main").dataset.transitionPage === "cases";
    const isCasesItem = this.instance.classList.contains("cases_item");
    
    let isFirstTwoCases = false;
    if (isCasesPage && isCasesItem) {
      const allCaseItems = document.querySelectorAll(".cases_item");
      const currentIndex = Array.from(allCaseItems).indexOf(this.instance);
      isFirstTwoCases = currentIndex < 2; // First two items (index 0 and 1)
    }
    
    const delay = isFirstTwoCases ? 1.2 : 0;

    // Mimic the 3D GL reveal effect in 2D
    this.tl.fromTo(
      this.instance,
      {
        autoAlpha: 0,
        rotationZ: -18, // equivalent to uRotate: -0.3
        rotationY: 45, // equivalent to uRotateY: 0.8
        rotationX: -45, // equivalent to uRotateX: -0.8
        scale: startScale,
      },
      {
        autoAlpha: 1,
        rotationZ: 0,
        rotationY: 0,
        rotationX: 0,
        scale: endScale,
        delay: delay, // Delay for case items on cases page
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
