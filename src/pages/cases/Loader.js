import { def } from "@utils/GSAP.js";

export default class Loader {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    this.hero = this.main.querySelector(".cases");
    this.items = this.main.querySelectorAll(".cases_item");
    this.meshs = this.app.gl?.world?.items?.meshs || [];
    this.title = this.hero.querySelector("h1");
    this.wrapperText = this.hero.querySelectorAll(".cases_text_wrapper");

    this.firstTwoItems = [...this.items].slice(0, 3);
    this.firstTwoMeshs = this.meshs.slice(0, 3);

    this.titleSplit = new SplitText(this.title, { type: "lines" });
    this.titleSplitSecond = new SplitText(this.title, {
      type: "lines",
      linesClass: "line-second",
    });
    gsap.set(this.titleSplitSecond.lines, {
      overflow: "clip",
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
      perspective: 1000,
    });

    this.destroyed = false;

    // Set initial states for mobile to prevent conflicts with MobFade
    if (window.innerWidth <= 992) {
      this.setMobileInitialStates();
    }

    this.init();
    this.handleMobileWrapperText();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.tl = gsap.timeline({
      defaults: { ease: def.ease, duration: 1 },
      onComplete: () => this.titleSplit.revert(),
    });

    // this.meshs.forEach(({mesh}, index) =>
    // {
    //     this.tl.fromTo(mesh.position, {z: 1500}, {z: 0, duration: 1.5}, index * 0.1)
    // })

    this.tl
      .fromTo(
        this.titleSplit.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3", stagger: 0.1 },
        0.8
      )
      .fromTo(
        this.titleSplit.lines,
        {
          rotateX: "-35deg",
          rotateY: "-5deg",
          z: "-1rem",
          transformStyle: "preserve-3d",
          transformOrigin: "50% 0",
        },
        {
          rotateX: "0deg",
          rotateY: "0deg",
          z: "0rem",
          stagger: 0.1,
          ease: "power2",
          stagger: 0.1,
        },
        "<"
      );

    // Only animate items on desktop - MobFade handles mobile animations
    if (window.innerWidth > 992) {
      this.tl.fromTo(
        this.firstTwoItems,
        { yPercent: 20, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          onUpdate: () => this.app.gl?.world?.items?.setPosition?.(),
        },
        "<0.2"
      );
    }

    // Only animate WebGL meshes on desktop
    if (window.innerWidth > 992) {
      this.firstTwoMeshs.forEach(({ mesh, material }) => {
        // Add 3D mesh rotation like home videos
        mesh.rotation.set(-0.8, 0.8, -0.3); // Start rotated - more dramatic
        mesh.scale.set(0.4, 0.4, 0.4); // Start small

        this.tl
          .fromTo(
            material.uniforms.uLoading,
            { value: 0 },
            { value: 1, duration: 1 },
            "<0.1"
          )
          .to(
            mesh.rotation,
            { x: 0, y: 0, z: 0, duration: 1, ease: "power3.out" },
            "<"
          )
          .to(
            mesh.scale,
            { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.2)" },
            "<"
          );
      });
    }
  }

  handleMobileWrapperText() {
    const isMobile = window.innerWidth < 992;

    if (isMobile) {
      this.wrapperText.forEach((wrapper) => {
        if (wrapper.children.length === 1) {
          wrapper.style.flexDirection = "row";
        }

        const emailTextElement = wrapper.querySelector(".cases_email_text");
        if (emailTextElement) {
          emailTextElement.textContent = "Contact Us";
        }
      });
    }
  }

  resize() {
    if (this.destroyed) return;

    this.titleSplit?.revert();
    this.handleMobileWrapperText();
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;

    this.tl?.kill();
  }

  setMobileInitialStates() {
    // Set initial states for title animation (same for all devices)
    gsap.set(this.titleSplit.lines, {
      y: "120%",
      rotateX: "-35deg",
      rotateY: "-5deg",
      z: "-1rem",
      transformStyle: "preserve-3d",
      transformOrigin: "50% 0",
    });

    // Don't set initial states for items - let MobFade handle them
    // MobFade will set: autoAlpha: 0, rotationZ: -18, rotationY: 45, rotationX: -45, scale: 0.4
  }
}
