import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export default class ServicesHero {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.title = this.instance.querySelector(".h-services_title");
    this.text = this.title.querySelector("h1");
    this.btn = this.instance.querySelector(".h-services_btn");
    this.bg = this.instance.querySelector(".h-services_bg");

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.tl = gsap.timeline({ paused: true });
    const middleY = window.innerHeight / 2;
    let top =
      this.title.getBoundingClientRect().top +
      this.title.getBoundingClientRect().height / 2 -
      middleY;
    
    // Cap mobile Y movement to reduce gap
    if (window.innerWidth < 992) {
      top = Math.min(Math.abs(top), 202) * Math.sign(top);
    }

    gsap.matchMedia().add(
      {
        isDesktop: `(min-width: 992px)`,
        isMobile: `(max-width: 991px)`,
      },
      (context) => {
        const { isDesktop, isMobile } = context.conditions;

        this.tl
          .fromTo(
            this.title,
            { y: 0 },
            { y: -top, ease: "power3", duration: 1 }
          )
          .fromTo(
            this.text,
            { scale: 1 },
            { scale: isDesktop ? 1.4 : 1.1, ease: "power3", duration: 1 },
            "<"
          )
          .fromTo(
            this.btn,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, ease: "power3", duration: 0.5 },
            0.5
          );
      }
    );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top top",
      end: "bottom bottom",
      // end: window.innerWidth < 992 ? "bottom center" : "bottom bottom",
      animation: this.tl,
      scrub: true,
      onUpdate: (self) => {
        if (window.innerWidth > 992) {
          if (this.app.gl.world.hero)
            this.app.gl.world.hero.material.uniforms.uScroll.value =
              self.progress;
        }

        this.bg.style.setProperty("--progress", self.progress);
        // this.updateSizePos(self.progress)
      },
    });
  }

  updateSizePos(progress) {
    const middleY = window.innerHeight / 2;
    const top =
      this.title.getBoundingClientRect().top +
      this.title.getBoundingClientRect().height / 2 -
      middleY;

    this.setters[0].y(-top * progress);
    // this.setters.scale(1 + progress * 0.2)
  }

  resize() {
    if (this.destroyed) return;

    this.tl?.kill();
    this.scroll?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }

  getTop(el) {
    let top = 0;
    while (el && el !== document.body) {
      top += el.offsetTop || 0;
      el = el.offsetParent;
    }
    return top;
  }
}
