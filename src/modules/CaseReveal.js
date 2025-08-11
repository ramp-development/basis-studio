import { gsap, ScrollTrigger, SplitText } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default class CaseReveal {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.init();

    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.caseItems = this.instance.querySelectorAll(".cases_item");
    this.splits = [];

    if (this.caseItems.length === 0) return;

    const isDesktop = window.innerWidth >= 992;

    // Set up text splits for each case item (both desktop and mobile)
    this.caseItems.forEach((item) => {
      const textElements = item.querySelectorAll("h2, h3, p"); // Add your text selectors

      textElements.forEach((textEl) => {
        if (textEl.textContent.trim().length > 0) {
          const split = new SplitText(textEl, { type: "lines" });
          const splitSecond = new SplitText(textEl, { type: "lines" });

          this.splits.push(split);
          this.splits.push(splitSecond);

          gsap.set(splitSecond.lines, {
            overflow: "clip",
          });

          gsap.set(split.lines, { y: "120%" });
        }
      });
    });

    if (isDesktop) {
      // Desktop: Combined animation for all items
      this.tl = gsap.timeline({
        paused: true,
        defaults: { duration: 1, ease: "power3.out" },
        onComplete: () => {
          this.splits.forEach((split) => split.revert());
        },
      });

      // Animate images with 3D effect
      this.caseImages = this.instance.querySelectorAll(".cases_image");
      if (this.caseImages.length > 0) {
        gsap.set(this.caseImages, {
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        });

        this.tl.fromTo(
          this.caseImages,
          {
            yPercent: 40,
            rotateY: 12,
            rotateX: 45,
            opacity: 0,
          },
          {
            yPercent: 0,
            rotateY: 0,
            rotateX: 0,
            opacity: 1,
            stagger: 0.08,
          },
          0
        );
      }

      // Animate text lines
      const allTextLines = this.splits
        .filter((_, index) => index % 2 === 0)
        .map((split) => split.lines)
        .flat();

      if (allTextLines.length > 0) {
        this.tl.fromTo(
          allTextLines,
          { y: "120%" },
          {
            y: "0%",
            stagger: 0.08,
            ease: "power3.out",
          },
          0.5
        );
      }

      this.scroll = ScrollTrigger.create({
        trigger: this.instance,
        start: "top 80%",
        onEnter: () => this.tl.play(),
      });

      this.scrollBack = ScrollTrigger.create({
        trigger: this.instance,
        start: "top bottom",
        onLeaveBack: () => this.tl.pause(0),
      });
    } else {
      // Mobile: Individual ScrollTriggers for each case item
      this.caseItems.forEach((item, index) => {
        const itemSplits = this.splits.filter(
          (split, splitIndex) =>
            Math.floor(splitIndex / 2) === index && splitIndex % 2 === 0
        );

        if (itemSplits.length > 0) {
          const itemLines = itemSplits.map((split) => split.lines).flat();

          ScrollTrigger.create({
            trigger: item,
            start: "top 90%",
            onEnter: () => {
              gsap.fromTo(
                itemLines,
                { y: "120%" },
                {
                  y: "0%",
                  stagger: 0.08,
                  ease: "power3.out",
                  duration: 0.8,
                  delay: 0.5,
                  // onComplete: () => {
                  //   itemSplits.forEach((split) => split.revert());
                  // },
                }
              );
            },
          });
        }
      });
    }
  }

  resize() {
    if (this.destroyed) return;

    this.splits.forEach((split) => split.revert());
    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.splits.forEach((split) => split.revert());
    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();
  }
}
