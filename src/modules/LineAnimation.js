import { CSS } from "@utils/Easings.js";
import BaseAnimation from "@utils/BaseAnimation.js";

export default class LineAnimation extends BaseAnimation {
  constructor(instance, app) {
    super(instance, app);

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    // Set perspective on .line-animation elements
    const lineAnimationItems =
      this.instance.querySelectorAll(".line-animation");
    if (lineAnimationItems.length > 0) {
      gsap.set(lineAnimationItems, {
        perspective: 1000,
        perspectiveOrigin: "center center",
      });
    }

    // Get all .line-item elements and their parents for overflow setup
    const lineItems = this.instance.querySelectorAll(".line-item");
    this.animationTargets = [];

    lineItems.forEach((item) => {
      // Set overflow hidden on parent element
      gsap.set(item.parentElement, {
        overflow: "hidden",
      });

      // Set up the line item with proper transform origin
      gsap.set(item, {
        transformOrigin: "center bottom",
        transformStyle: "preserve-3d",
        y: "120%",
        rotateX: "-90deg",
      });

      this.animationTargets.push(item);
    });

    // Create timeline with optional delay
    const delay = parseFloat(this.instance.dataset.delay) || 0;
    this.tl = gsap.timeline({
      paused: true,
      delay: delay,
      defaults: { duration: 0.8, ease: CSS },
    });

    this.animationTargets.forEach((target, index) => {
      this.tl.to(
        target,
        {
          y: "0%",
          rotateX: "0deg",
        },
        index * 0.1 // Stagger the animations
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
      this.tl.pause(0);
      super.animateOut(); // Sets this.isVisible = false
    }
  }

  resize() {
    if (this.destroyed) return;

    this.tl?.kill();
    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.tl?.kill();
    super.destroy();
  }
}
