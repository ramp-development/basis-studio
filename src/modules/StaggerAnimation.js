import App from "@app";
const app = App.getInstance();

export default class StaggerAnimation {
  constructor(instance) {
    this.instance = instance;

    this.destroyed = false;
    this.splits = [];

    this.init();
    app.on("resize", () => this.resize());
    app.on("destroy", () => this.destroy());
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    this.parentItems = this.instance.querySelectorAll(".stagger-animation");

    if (this.parentItems.length === 0) return;

    gsap.set(this.parentItems, {
      overflow: "hidden",
    });

    this.items = this.instance.querySelectorAll(
      ".stagger-item, .paragraph-item"
    );
    this.animationTargets = [];

    this.items.forEach((item) => {
      const textChildren = item.children.length > 0 ? item.children : [item];
      const hasTextContent = Array.from(textChildren).some(
        (child) =>
          child.textContent.trim().length > 0 &&
          (child.tagName === "P" ||
            child.tagName === "H1" ||
            child.tagName === "H2" ||
            child.tagName === "H3" ||
            child.tagName === "H4" ||
            child.tagName === "H5" ||
            child.tagName === "H6" ||
            child.tagName === "SPAN" ||
            child.tagName === "DIV")
      );

      if (hasTextContent) {
        const split = new SplitText(textChildren, { type: "lines" });
        const splitSecond = new SplitText(textChildren, { type: "lines" });

        this.splits.push(split);
        // this.splits.push(splitSecond);

        gsap.set(splitSecond.lines, {
          overflow: "clip",
        });

        gsap.set(split.lines, { y: "120%" });
        this.animationTargets.push(split.lines);
      } else {
        gsap.set(item, { y: "120%" });
        this.animationTargets.push(item);
      }
    });

    this.tl = gsap.timeline({
      paused: true,
    });

    const isMobile = window.innerWidth < 992;

    if (isMobile) {
      this.animationTargets.forEach((target, index) => {
        const itemTl = gsap.timeline({ paused: true });
        itemTl.to(target, {
          y: "0%",
          duration: 0.6,
          ease: "power2.out",
          stagger: Array.isArray(target) ? 0.05 : 0,
        });

        ScrollTrigger.create({
          trigger: this.items[index],
          start: "top 90%",
          onEnter: () => itemTl.play(),
        });

        ScrollTrigger.create({
          trigger: this.items[index],
          start: "top bottom",
          onLeaveBack: () => itemTl.pause(0),
        });
      });
    } else {
      this.animationTargets.forEach((target, index) => {
        this.tl.to(
          target,
          {
            y: "0%",
            duration: 0.6,
            ease: "power2.out",
            stagger: Array.isArray(target) ? 0.05 : 0,
          },
          index * 0.05
        );
      });

      this.scroll = ScrollTrigger.create({
        trigger: this.instance,
        start: "top 85%",
        onEnter: () => this.tl.play(),
      });

      // this.scrollBack = ScrollTrigger.create({
      //   trigger: this.instance,
      //   start: "top bottom",
      //   onLeaveBack: () => this.tl.pause(0),
      // });
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
