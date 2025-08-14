import gsap from "gsap";
import { SplitText, def } from "@utils/GSAP.js";

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
      )
      .fromTo(
        this.firstTwoItems,
        { yPercent: 20, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          onUpdate: () => this.app.gl?.world?.items?.setPosition?.(),
        },
        "<0.2"
      );

    this.firstTwoMeshs.forEach(({ material }) => {
      this.tl.fromTo(
        material.uniforms.uLoading,
        { value: 0 },
        { value: 1, duration: 1 },
        "<0.1"
      );
    });
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
}
