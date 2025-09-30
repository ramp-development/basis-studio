import { def } from "@utils/GSAP.js";
import App from "@app";
const app = App.getInstance();

export default class Loader {
  constructor(main) {
    this.main = main;

    this.hero = this.main.querySelector(".hero");
    this.title = this.hero.querySelector("h1");
    this.descr = this.hero.querySelector("p");
    this.btn = this.hero.querySelector(".btn");
    this.imagesParent = this.hero.querySelector(".hero_images");
    this.images = this.imagesParent.querySelectorAll(".hero_image");

    this.titleSplit = new SplitText(this.title, {
      type: "lines",
      mask: "lines",
    });
    gsap.set(this.titleSplit.lines, {
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
      perspective: 1000,
    });

    this.descrSplit = new SplitText(this.descr, {
      type: "lines",
      mask: "lines",
    });
    gsap.set(this.descrSplit.lines, {
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
    });

    this.destroyed = false;

    // Set initial states immediately to prevent flash of content
    this.setInitialStates();

    this.checkInit();
    app.on("resize", () => this.resize());
    app.on("destroy", () => this.destroy());
  }

  setInitialStates() {
    // Set initial animation states to prevent flash of content during transitions
    if (window.innerWidth <= 992) {
      // Mobile: Simple initial states - no 3D transforms
      gsap.set(this.titleSplit.lines, {
        yPercent: 120,
      });

      // Ensure images are completely hidden during transitions
      gsap.set(this.imagesParent, {
        yPercent: 20,
        scale: 0.6,
        autoAlpha: 0, // Use autoAlpha for visibility: hidden + opacity: 0
      });

      gsap.set(this.images, {
        scale: 0.8,
        opacity: 0,
        autoAlpha: 0, // Double ensure they're hidden
      });
    } else {
      // Desktop: Full 3D transforms
      gsap.set(this.titleSplit.lines, {
        yPercent: 120,
        rotateX: "-35deg",
        rotateY: "-5deg",
        z: "-1rem",
        transformStyle: "preserve-3d",
        transformOrigin: "50% 0",
      });
    }

    gsap.set(this.descrSplit.lines, {
      yPercent: 120,
    });

    gsap.set(this.btn, {
      opacity: 0,
      filter: "blur(10px)",
    });
  }

  checkInit() {
    if (window.innerWidth > 992) {
      this.init();
    } else {
      this.mobInit();
    }
  }

  init() {
    this.meshs = app.gl.world.hero.meshs;
    this.group = app.gl.world.hero.group;

    this.tl = gsap.timeline({
      defaults: { ease: def.ease, duration: 1.4 },
      onStart: () => {
        // Play videos 85% through the animation
        const duration = this.tl.duration();
        const staticMultiplier = 0.85;
        const timeout = duration * staticMultiplier * 1000;
        setTimeout(() => {
          app.trigger("homeAnimationStatic");
        }, timeout);
      },
      onComplete: () => {
        this.titleSplit.revert();
        this.descrSplit.revert();
        // Enable mouse interactions after animation completes
        app.trigger("homeAnimationComplete");
      },
    });

    this.tl.fromTo(
      this.group.position,
      { y: -window.innerHeight / 2 },
      { y: 0, duration: 3.5, ease: "power1" },
      0
    );

    this.meshs.forEach(({ mesh }, index) => {
      this.tl
        .fromTo(
          mesh.position,
          { z: 600 },
          { z: 0, stagger: 0.1, duration: 2.5, ease: "power1" },
          index * 0.2 + 0.4
        )
        .fromTo(
          mesh.material.uniforms.uOpacity,
          { value: 0 },
          { value: 1, duration: 3.5 },
          "<"
        );
    });

    this.tl
      .to(
        this.titleSplit.lines,
        { yPercent: 0, stagger: 0.1, ease: "power3" },
        "<0.2"
      )
      .to(
        this.titleSplit.lines,
        {
          rotateX: "0deg",
          rotateY: "0deg",
          z: "0rem",
          stagger: 0.1,
          ease: "power2",
          stagger: 0.1,
        },
        "<"
      )
      .to(
        this.descrSplit.lines,
        { yPercent: 0, stagger: 0.1, ease: "power3" },
        "<0.2"
      )
      .to(this.btn, { opacity: 1, filter: "blur(0px)" }, "<0.3");
  }

  mobInit() {
    this.tl = gsap.timeline({
      defaults: { ease: def.ease, duration: 1.4 },
      onStart: () => {
        // Play videos 85% through the animation
        const duration = this.tl.duration();
        const staticMultiplier = 0.85;
        const timeout = duration * staticMultiplier * 1000;
        setTimeout(() => {
          app.trigger("homeAnimationStatic");
        }, timeout);
      },
      onComplete: () => {
        this.titleSplit.revert();
        this.descrSplit.revert();
        // Enable mouse interactions after animation completes
        app.trigger("homeAnimationComplete");
      },
    });

    this.tl
      // Simplified mobile text animation - no 3D transforms
      .from(this.images, {
        yPercent: -80,
        duration: 3.5,
        ease: "power1.inOut",
        stagger: 0.2,
      })
      .to(
        this.titleSplit.lines,
        { yPercent: 0, duration: 2, stagger: 0.1, ease: "power3" },
        "<2"
      )
      .to(
        this.descrSplit.lines,
        { yPercent: 0, duration: 2, stagger: 0.1, ease: "power3" },
        "<0.2"
      )
      .to(this.btn, { opacity: 1, filter: "blur(0px)" }, "<0.3")
      .to(
        this.imagesParent,
        {
          yPercent: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 2,
          ease: "power1",
          force3D: true,
        },
        0.6
      )
      .to(
        this.images,
        {
          scale: 1,
          opacity: 1,
          autoAlpha: 1,
          duration: 2,
          ease: "power1",
          stagger: 0.15,
          force3D: true,
        },
        0.4
      );
  }

  resize() {
    if (this.destroyed) return;

    this.titleSplit?.revert();
    this.descrSplit?.revert();
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;

    this.tl?.kill();
  }
}
