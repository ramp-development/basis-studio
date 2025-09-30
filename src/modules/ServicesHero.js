import App from "@app";
const app = App.getInstance();

export default class ServicesHero {
  constructor(instance) {
    this.instance = instance;

    this.destroyed = false;
    this.isMobile = window.innerWidth < 992;

    this.title = this.instance.querySelector(".h-services_title");
    this.text = this.title.querySelector("h1");
    this.btn = this.instance.querySelector(".h-services_btn");
    this.bg = this.instance.querySelector(".h-services_bg");

    this.init();
    app.on("resize", () => this.resize());
    app.on("destroy", () => this.destroy());
  }

  init() {
    if (this.isMobile) {
      this.initMobile();
    } else {
      this.initDesktop();
    }
  }

  initMobile() {
    // Simplified mobile version with minimal animations
    this.tl = gsap.timeline({ paused: true });

    // Calculate Y movement to create proper spacing (simplified calculation)
    const titleHeight = this.title.offsetHeight;
    const minYMovement = Math.min(titleHeight * 0.5, 150); // Increased movement and cap

    this.tl
      .fromTo(
        this.title,
        { y: 0 },
        { y: -minYMovement, ease: "power2.out", duration: 1 }
      )
      .fromTo(
        this.text,
        { scale: 1 },
        { scale: 1.05, ease: "power2.out", duration: 1 },
        "<"
      )
      .fromTo(
        this.btn,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.4 },
        0.3
      );

    // Lighter scroll trigger for mobile
    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top top",
      end: "bottom center",
      animation: this.tl,
      scrub: 1, // Smoother scrubbing
      onUpdate: (self) => {
        // Only update CSS custom property, no WebGL or complex calculations
        this.bg.style.setProperty("--progress", self.progress);
      },
    });
  }

  initDesktop() {
    this.tl = gsap.timeline({ paused: true });
    const middleY = window.innerHeight / 2;
    const titleRect = this.title.getBoundingClientRect();
    const top = titleRect.top + titleRect.height / 2 - middleY;

    this.tl
      .fromTo(this.title, { y: 0 }, { y: -top, ease: "power3", duration: 1 })
      .fromTo(
        this.text,
        { scale: 1 },
        { scale: 1.4, ease: "power3", duration: 1 },
        "<"
      )
      .fromTo(
        this.btn,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "power3", duration: 0.5 },
        0.5
      );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top top",
      end: "bottom bottom",
      animation: this.tl,
      scrub: true,
      onUpdate: (self) => {
        if (app.gl?.world?.hero?.material?.uniforms?.uScroll) {
          app.gl.world.hero.material.uniforms.uScroll.value = self.progress;
        }
        this.bg.style.setProperty("--progress", self.progress);
      },
    });
  }

  resize() {
    if (this.destroyed) return;

    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 992;

    // Only reinitialize if device type changed
    if (wasMobile !== this.isMobile) {
      this.tl?.kill();
      this.scroll?.kill();
      this.init();
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.tl?.kill();
    this.scroll?.kill();
    this.tl = null;
    this.scroll = null;
  }
}
