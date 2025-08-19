import { gsap, SplitText } from "@utils/GSAP.js";
import BaseAnimation from "@utils/BaseAnimation.js";

export default class ParagraphAnimation extends BaseAnimation {
  constructor(instance, app) {
    super(instance, app);
    this.splits = [];
    this.animationTargets = [];
    this.tl = null;

    this.init();
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    // Set parent to overflow hidden (like StaggerAnimation)
    const parentItems = this.instance.querySelectorAll(".paragraph-animation");
    if (parentItems.length > 0) {
      gsap.set(parentItems, {
        overflow: "hidden",
      });
    }

    // Get paragraph items
    this.items = this.instance.querySelectorAll(".paragraph-item");

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

    // Create timeline with optional delay
    const delay = parseFloat(this.instance.dataset.delay) || 0;
    this.tl = gsap.timeline({
      paused: true,
      delay: delay,
    });

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
  }

  animateIn() {
    if (this.tl && !this.isVisible) {
      this.tl.play();
      super.animateIn(); // Sets this.isVisible = true
    }
  }

  animateOut() {
    if (this.tl && this.isVisible) {
      this.tl.pause(0); // Reset to beginning
      super.animateOut(); // Sets this.isVisible = false
    }
  }

  destroy() {
    this.splits.forEach((split) => split.revert());
    this.tl?.kill();
  }
}
