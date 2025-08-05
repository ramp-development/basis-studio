import { gsap, SplitText } from "gsap/all";
import { def } from "@utils/GSAP.js";

gsap.registerPlugin(SplitText);

export default class Loader {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    this.hero = this.main.querySelector(".hero");
    this.title = this.hero.querySelector("h1");
    this.descr = this.hero.querySelector("p");
    this.btn = this.hero.querySelector(".btn");
    this.imagesParent = this.hero.querySelector(".hero_images");
    this.images = this.imagesParent.querySelectorAll(".hero_image");

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
    this.descrSplit = new SplitText(this.descr, { type: "lines" });
    this.descrSplitSecond = new SplitText(this.descr, { type: "lines" });
    gsap.set(this.descrSplitSecond.lines, {
      overflow: "clip",
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
    });

    this.destroyed = false;

    this.checkInit();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  checkInit() {
    if (window.innerWidth > 992) {
      this.init();
    } else {
      this.mobInit();
    }
  }

  init() {
    this.meshs = this.app.gl.world.hero.meshs;
    this.group = this.app.gl.world.hero.group;

    this.tl = gsap.timeline({
      defaults: { ease: def.ease, duration: 1.4 },
      onComplete: () => {
        this.titleSplit.revert();
        this.descrSplit.revert();
      },
    });

    this.meshs.forEach(({ mesh }, index) => {
      this.tl
        .fromTo(
          mesh.position,
          { z: 600 },
          { z: 0, duration: 3.5 },
          index * 0.1 + 0.4
        )
        .fromTo(
          mesh.material.uniforms.uOpacity,
          { value: 0 },
          { value: 1, duration: 4.5 },
          "<"
        );
    });

    this.tl.fromTo(
      this.group.position,
      { y: window.innerHeight / 2 },
      { y: 0, duration: 3.5, ease: "power1" },
      0
    );

    this.tl
      .fromTo(
        this.titleSplit.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3", stagger: 0.1 },
        "<0.2"
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
      )

      .fromTo(
        this.descrSplit.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3" },
        "<0.2"
      )

      .fromTo(
        this.btn,
        { opacity: 0, filter: "blur(10px)" },
        { opacity: 1, filter: "blur(0px)" },
        "<0.3"
      );
  }

  mobInit() {
    this.tl = gsap.timeline({
      defaults: { ease: def.ease, duration: 1.4 },
      onComplete: () => {
        this.titleSplit.revert();
        this.descrSplit.revert();
      },
    });

    this.tl
      .fromTo(
        this.titleSplit.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3", stagger: 0.1 },
        0.6
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
      )

      .fromTo(
        this.descrSplit.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3" },
        "<0.2"
      )

      .fromTo(
        this.btn,
        { opacity: 0, filter: "blur(10px)" },
        { opacity: 1, filter: "blur(0px)" },
        "<0.3"
      )

      .fromTo(
        this.imagesParent,
        { yPercent: 20, scale: 0.6 },
        { yPercent: 0, scale: 1, duration: 4, ease: "power1", force3D: true },
        0.6
      )
      .fromTo(
        this.images,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 3,
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
