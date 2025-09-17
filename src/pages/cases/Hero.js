import { gsap, ScrollTrigger } from "@utils/GSAP.js";

export default class Hero {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    if (window.innerWidth < 991) return;

    this.hero = this.main.querySelector(".cases");
    this.sticky = this.hero.querySelector(".cases_sticky");
    this.wrapper = this.hero.querySelector(".cases_wrapper");
    this.list = this.hero.querySelector(".cases_list");
    this.items = this.hero.querySelectorAll(".cases_item");

    this.destroyed = false;

    // Set sizes immediately for Safari - before WebGL initialization
    this.setSizes();

    // Setup parallax after GL world is ready
    this.quicks = [];

    const setupParallax = () => {
      if (!this.app.gl?.world?.items?.meshs) {
        console.warn("GL world items not ready, skipping parallax setup");
        return;
      }

      this.quicks = [...this.items]
        .map((item, index) => {
          const mesh = this.app.gl.world.items.meshs[index]?.mesh;
          if (!mesh) return null;

          return gsap.quickTo(mesh.material.uniforms.uParallax, "value", {
            duration: 0.3,
            ease: "power2",
          });
        })
        .filter(Boolean);
    };

    // Try to setup parallax immediately if world is ready
    setupParallax();

    // Also listen for world load event if not ready yet
    if (!this.app.gl?.world?.items?.meshs) {
      this.app.once("loadedWorld", () => {
        setupParallax();
        // Re-set sizes after WebGL is ready
        this.setSizes();
      });
    }

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    // Sizes already set in constructor
    this.hero.style.setProperty("--length", this.items.length);
    const left = this.hero.getBoundingClientRect().left;
    const start = this.wrapper.getBoundingClientRect().left;
    const width = this.list.getBoundingClientRect().width;
    const end = width + start - window.innerWidth + left;

    this.tl = gsap.timeline({});

    this.tl.fromTo(
      this.sticky,
      { x: 0 },
      { x: -end, ease: "none", duration: 1.5 }
    );

    this.srcoll = ScrollTrigger.create({
      trigger: this.hero,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      animation: this.tl,
    });

    this.scrolls = [];
    this.innerTls = [];
    this.enterInnerTls = [];

    this.items.forEach((item, index) => {
      const mesh = this.app.gl?.world?.items?.meshs?.[index]?.mesh;
      if (!mesh) return;

      // Size calculation moved to constructor with requestAnimationFrame

      this.scrolls[index] = ScrollTrigger.create({
        trigger: item,
        containerAnimation: this.tl,
        start: "left right",
        end: "right left",
        onUpdate: (self) => {
          const progress = gsap.utils.mapRange(
            0,
            1,
            -0.05,
            0.05,
            self.progress
          );
          this.quicks[index](progress);
          // mesh.material.uniforms.uParallax.value = progress
        },
      });
      // Set initial 3D state and animate mesh rotation
      mesh.rotation.set(-0.1, 0.1, -0.1); // Start rotated - more dramatic
      // mesh.rotation.set(-0.8, 0.8, -0.3); // Start rotated - more dramatic
      mesh.scale.set(0.4, 0.4, 0.4); // Start small

      if (index < 3) return;

      // Set initial uLoading to 0 for items that will fade in
      // mesh.material.uniforms.uLoading.value = 0;

      this.innerTls[index] = gsap.timeline({
        paused: true,
        defaults: { ease: "power3", duration: 1 },
      });

      this.innerTls[index]
        .fromTo(mesh.material.uniforms.uLoading, { value: 0 }, { value: 1 })
        .to(
          mesh.rotation,
          { x: 0, y: 0, z: 0, duration: 1, ease: "power3.out" },
          "<"
        )
        .to(
          mesh.scale,
          { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.2)" },
          "<"
        )
        .fromTo(
          item,
          { yPercent: 20, opacity: 0 },
          { yPercent: 0, opacity: 1 },
          "<"
        );

      this.enterInnerTls[index] = ScrollTrigger.create({
        trigger: item,
        start: "left 75%",
        containerAnimation: this.tl,
        onEnter: () => this.innerTls[index].play(),
      });
    });
  }

  setSizes() {
    // this.items.forEach((item) => {
    //   const height = item.getBoundingClientRect().height;
    //   const width = (height / 640) * 326;
    //   item.style.width = `${width}px`;
    //   item.style.aspectRatio = `${width} / ${height}`;
    //   item.style.height = `${height}px`;
    // });
  }

  resize() {
    if (this.destroyed) return;

    this.tl?.kill();
    this.srcoll?.kill();
    this.scrolls.forEach((scroll) => scroll?.kill());

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.tl?.kill();
    this.srcoll?.kill();
    this.scrolls.forEach((scroll) => scroll?.kill());
  }
}
