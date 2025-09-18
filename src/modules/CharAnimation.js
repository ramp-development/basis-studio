export default class CharAnimation {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.text =
      this.instance.children.length > 0
        ? this.instance.children
        : this.instance;

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    this.split = new SplitText(this.text, { type: "lines", mask: "lines" });
    gsap.set(this.split.lines, {
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
      perspective: 1000,
    });

    this.tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1.2 },
      onComplete: () => {
        if (this.split.isSplit) {
          console.log("reverting split:", this.split);
          this.split.revert();
        } else {
          console.log("split is not split:", this.split);
        }
      },
    });

    this.tl
      .fromTo(
        this.split.lines,
        { yPercent: 120 },
        {
          yPercent: 0,
          stagger: 0.1,
          ease: "power3",
          stagger: 0.1,
        },
        "<0.2"
      )
      .fromTo(
        this.split.lines,
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

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top 90%",
      onEnter: () => this.tl.play(),
    });

    this.srcollBack = ScrollTrigger.create({
      trigger: this.instance,
      start: "top bottom",
      onLeaveBack: () => this.tl.pause(0),
    });
  }

  resize() {
    if (this.destroyed) return;

    console.log("resizing char animation");

    this.played = false;

    this.split?.revert();
    this.tl?.kill();
    this.scroll?.kill();
    this.srcollBack?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
