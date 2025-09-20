export default class WordAnimation {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.destroyed = false;

    this.init();

    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;
    if (window.innerWidth >= 992) return;

    const svgElement = this.instance.querySelector("svg");
    const isSVG = svgElement !== null;

    if (isSVG) {
      this.paths = svgElement.querySelectorAll("path");

      gsap.set(this.paths, {
        transformOrigin: "50% 50%",
        opacity: 0,
        scaleY: 0,
      });

      this.tl = gsap.timeline({
        paused: true,
      });

      this.tl.to(this.paths, {
        opacity: 1,
        scaleY: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
      });
    } else {
      this.split = new SplitText(this.instance, { type: "chars" });

      gsap.set(this.instance, {
        overflow: "hidden",
        whiteSpace: "nowrap",
      });

      gsap.set(this.split.chars, {
        display: "inline-block",
        transformStyle: "preserve-3d",
        transformOrigin: "50% 0%",
        verticalAlign: "top",
      });

      this.tl = gsap.timeline({
        paused: true,
        // onComplete: () => this.split.revert(),
      });

      this.tl.fromTo(
        this.split.chars,
        {
          y: "100%",
          rotateX: "-90deg",
          rotateY: "0deg",
          z: "0",
        },
        {
          y: "0%",
          rotateX: "0deg",
          rotateY: "0deg",
          z: "0",
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.15,
        }
      );
    }

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: isSVG ? "top 70%" : "top 90%",
      onEnter: () => this.tl.play(),
    });

    this.scrollBack = ScrollTrigger.create({
      trigger: this.instance,
      start: "top bottom",
      onLeaveBack: () => this.tl.pause(0),
    });

    // setTimeout(() => {
    //   ScrollTrigger.refresh();
    // }, 2000);
  }

  resize() {
    if (this.destroyed) return;

    // this.split?.revert();
    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.split?.revert();
    this.tl?.kill();
    this.scroll?.kill();
    this.scrollBack?.kill();
  }
}
