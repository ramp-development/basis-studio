import { gsap, SplitText, ScrollTrigger } from "gsap/all";
import { def } from "@utils/GSAP.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default class Goals {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.list = this.instance.querySelector(".goals_list");
    this.items = this.list.querySelectorAll(".goals_item");

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.sectionHeight = this.instance.offsetHeight - window.innerHeight * 0.8;
    this.itemPart = this.sectionHeight / this.items.length;

    this.splits = [...this.items].map((item) => {
      const left = item.querySelector(".v-flex-left-center");
      const right = item.querySelector(".v-flex-right-center");

      const titleSplit = new SplitText(left.querySelector("p"), {
        type: "lines",
        linesClass: "line",
      });
      const titleSplitParent = new SplitText(left.querySelector("p"), {
        type: "lines",
        linesClass: "line-parent",
      });
      const descrSplit = new SplitText(right.querySelector("p"), {
        type: "lines",
        linesClass: "line",
      });
      const descrSplitParent = new SplitText(right.querySelector("p"), {
        type: "lines",
        linesClass: "line-parent",
      });

      // Set up parent lines with overflow hidden and perspective
      const lineParents = [
        ...titleSplitParent.lines,
        ...descrSplitParent.lines,
      ];
      gsap.set(lineParents, {
        overflow: "hidden",
        perspective: 1000,
        perspectiveOrigin: "center center",
      });

      // Set up child lines with initial 3D state
      const lines = [...titleSplit.lines, ...descrSplit.lines];
      gsap.set(lines, {
        y: "120%",
        rotateX: "-35deg",
        transformOrigin: "center bottom",
        transformStyle: "preserve-3d",
      });

      return { title: titleSplit, descr: descrSplit };
    });

    this.mastelTL = gsap.timeline({ paused: true, defaults: { ease: "none" } });

    this.tls = [...this.items].map((item, index) => {
      const split = this.splits[index];

      const tl = gsap.timeline({
        defaults: {
          ease: "power3",
          duration: def.duration,
          stagger: { from: "center", each: def.stagger },
        },
      });

      // OLD BLUR EFFECT - COMMENTED FOR ROLLBACK
      // if(index > 0)
      // {
      //     tl.to(this.splits[index - 1].title.words, {opacity: 0, filter: 'blur(10px)', overwrite: 'auto', stagger: {each: 0.01, from: 'random'}, duration: 0.8}, 0)
      //     .to(this.splits[index - 1].descr.words, {opacity: 0, filter: 'blur(10px)', overwrite: 'auto', stagger: {each: 0.01, from: 'random'}, duration: 0.8}, 0)
      //     .to(this.items[index - 1].querySelector('.goals_number'), {opacity: 0, filter: 'blur(10px)', overwrite: 'auto'}, 0)
      // }
      //
      // tl.fromTo(split.title.words,
      //     { autoAlpha: 0, filter: 'blur(10px)' },
      //     { autoAlpha: 1, filter: 'blur(0px)', stagger: {each: 0.01, from: 'random'}, overwrite: 'auto' }, '<50%')
      // .fromTo(split.descr.words,
      //     { autoAlpha: 0, filter: 'blur(10px)' },
      //     { autoAlpha: 1, filter: 'blur(0px)', stagger: {each: 0.05, from: 'random'}, overwrite: 'auto' }, '<0.1')
      // .fromTo(item.querySelector('.goals_number'), { autoAlpha: 0, filter: 'blur(10px)' }, { autoAlpha: 1, filter: 'blur(0px)', overwrite: 'auto' }, '<0.1')

      // NEW 3D REVEAL EFFECT - ADAPTED FROM HOMECTA
      if (index > 0) {
        tl.to(
          this.splits[index - 1].title.lines,
          {
            rotateX: "-35deg",
            z: "-1rem",
            y: "120%",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
            stagger: 0.1,
            duration: 0.8,
          },
          0
        )
          .to(
            this.splits[index - 1].descr.lines,
            {
              rotateX: "-35deg",
              z: "-1rem",
              y: "120%",
              transformStyle: "preserve-3d",
              transformOrigin: "50% 0",
              stagger: 0.1,
              duration: 0.8,
            },
            0
          )
          .to(
            this.items[index - 1].querySelector(".goals_number"),
            {
              rotateX: "-15deg",
              z: "-1rem",
              y: "120%",
              transformStyle: "preserve-3d",
              transformOrigin: "50% 0",
            },
            0
          );
      }

      tl.fromTo(
        split.title.lines,
        { y: "120%" },
        { y: "0%", stagger: 0.1, ease: "power3" },
        "<50%"
      )
        .fromTo(
          split.title.lines,
          {
            rotateX: "-35deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
          },
          {
            rotateX: "0deg",
            z: "0rem",
            stagger: 0.1,
            ease: "power2",
          },
          "<0.2"
        )
        .fromTo(
          split.descr.lines,
          { y: "120%" },
          { y: "0%", stagger: 0.1, ease: "power3" },
          "<0.1"
        )
        .fromTo(
          split.descr.lines,
          {
            rotateX: "-35deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
          },
          {
            rotateX: "0deg",
            z: "0rem",
            stagger: 0.1,
            ease: "power2",
          },
          "<0.2"
        )
        .fromTo(
          item.querySelector(".goals_number"),
          { y: "120%" },
          { y: "0%", ease: "power3" },
          "<0.1"
        )
        .fromTo(
          item.querySelector(".goals_number"),
          {
            rotateX: "-15deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
          },
          {
            rotateX: "0deg",
            z: "0rem",
            ease: "power2",
          },
          "<0.2"
        );

      const start = index === 0 ? 0 : ">0.2";

      this.mastelTL.add(tl, start);

      return tl;
    });

    // this.mastelTL.fromTo(
    //   this.instance.querySelectorAll(".goals_number"),
    //   { scale: 1 },
    //   { scale: 1.4, stagger: 0, duration: this.mastelTL.duration() },
    //   0
    // );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top top",
      end: "bottom bottom+=100%",
      scrub: true,
      animation: this.mastelTL,
    });
  }

  resize() {
    if (this.destroyed) return;

    this.splits.forEach((split) => {
      split.title.revert();
      split.descr.revert();
    });

    this.tls.forEach((tl) => tl.kill());
    this.mastelTL.kill();
    this.scroll.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
