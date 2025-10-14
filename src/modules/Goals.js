import { def } from "@utils/GSAP.js";
import App from "@app";

const app = App.getInstance();

export default class Goals {
  constructor(instance) {
    this.instance = instance;

    this.list = this.instance.querySelector(".goals_list");
    this.items = this.list.querySelectorAll(".goals_item");

    this.destroyed = false;

    this.init();
    app.on("resize", () => this.resize());
    app.on("destroy", () => this.destroy());
  }

  init() {
    this.sectionHeight = this.instance.offsetHeight - window.innerHeight;
    this.itemPart = this.sectionHeight / this.items.length;

    this.splits = [...this.items].map((item) => {
      const left = item.querySelector(".v-flex-left-center p");
      const right = item.querySelector(".v-flex-right-center p");

      const titleSplit = new SplitText(left, {
        type: "lines",
        mask: "lines",
      });

      const descrSplit = new SplitText(right, {
        type: "lines",
        mask: "lines",
      });

      gsap.set([left, right], {
        perspective: 1000,
        perspectiveOrigin: "center center",
      });

      // Set up child lines with initial 3D state and perspective
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
              duration: 1.2, // Slower duration for number hiding
            },
            0
          );
      }

      tl.from(
        split.title.lines,
        { y: "120%", stagger: 0.1, ease: "power3" },
        "<50%"
      )
        .from(
          split.title.lines,
          {
            rotateX: "-35deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
            stagger: 0.1,
            ease: "power2",
          },
          "<0.2"
        )
        .from(
          split.descr.lines,
          { y: "120%", stagger: 0.1, ease: "power3" },
          "<0.1"
        )
        .from(
          split.descr.lines,
          {
            rotateX: "-35deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
            stagger: 0.1,
            ease: "power2",
          },
          "<0.2"
        )
        // Add slower number animations back to main timeline
        .from(
          item.querySelector(".goals_number"),
          { y: "120%", ease: "power3", duration: 2 }, // Slower duration for numbers
          "<0.2"
        )
        .from(
          item.querySelector(".goals_number"),
          {
            rotateX: "-15deg",
            z: "-1rem",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 0",
            ease: "power2",
            duration: 2, // Slower duration for numbers
          },
          "<0.3"
        );

      const start = index === 0 ? 0 : ">0.2";

      this.mastelTL.add(tl, start);

      return tl;
    });

    // Main scroll trigger for everything - slower speed
    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top top",
      end: "bottom bottom", // Longer scroll distance for slower animation
      scrub: 2, // Slower scrub value (higher = slower)
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
