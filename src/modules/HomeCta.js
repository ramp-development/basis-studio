import { gsap, SplitText, ScrollTrigger } from "gsap/all";
import { def } from "@utils/GSAP.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default class HomeCta {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;
    this.scroll = this.app.scroll.lenis;

    this.destroyed = false;

    this.section = this.instance.querySelector(".h-cta");
    this.items = this.instance.querySelectorAll(".h-cta_item");
    this.section.style.setProperty("--length", `${this.items.length}`);
    ScrollTrigger.refresh();

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.splits = [...this.items].map((item) => {
      const text = item.querySelector(".heading_span");
      return new SplitText(text, { type: "lines, words", linesClass: "line" });
    });

    this.sectionHeight = this.section.offsetHeight - window.innerHeight * 0.8;
    this.itemPart = this.sectionHeight / this.items.length;
    this.masterTl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

    this.tls = [...this.items].map((item, index) => {
      const split = this.splits[index];
      gsap.set(split.lines, {
        overflow: "clip",
        paddingBottom: "0.1em",
        marginBottom: "-0.1em",
        perspective: 1000,
      });
      const tl = gsap.timeline({ defaults: { ease: "power3", duration: 1 } });

      if (index > 0) {
        tl.to(
          this.splits[index - 1].words,
          // {yPercent: 0, opacity: 1, filter: 'blur(0px)', scale: 1},
          {
            rotateX: "-35deg",
            rotateY: "-5deg",
            z: "-1rem",
            y: "120%",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
            stagger: 0.1,
            duration: 0.8,
          },
          0
        );
      }
      tl.fromTo(
        split.words,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3", stagger: 0.1 },
        "<50%"
      );
      tl.fromTo(
        split.words,
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
        "<0.2"
      );

      const start = index === 0 ? 0 : ">0.2";

      this.masterTl.add(tl, start);

      return tl;
    });

    this.scroll = ScrollTrigger.create({
      trigger: this.section,
      start: "top top",
      end: "bottom bottom+=100%",
      scrub: true,
      animation: this.masterTl,
    });
  }

  getTop(el) {
    let top = 0;
    while (el && el !== document.body) {
      top += el.offsetTop || 0;
      el = el.offsetParent;
    }
    return top;
  }

  resize() {
    if (this.destroyed) return;

    this.splits.forEach((split) => split.revert());
    this.tls.forEach((tl) => tl.kill());
    this.masterTl.kill();
    this.scroll.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
