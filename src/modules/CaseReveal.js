import { gsap, SplitText } from "@utils/GSAP.js";
import BaseAnimation from "@utils/BaseAnimation.js";

export default class CaseReveal extends BaseAnimation {
  constructor(instance, app) {
    super(instance, app);
    this.splits = [];
    this.tl = null;

    this.init();
  }

  init() {
    if (this.instance.dataset.scroll === "false") return;

    this.caseItems = this.instance.querySelectorAll(".cases_item");
    if (this.caseItems.length === 0) return;

    // Set up text splits for each case item
    this.caseItems.forEach((item) => {
      const textElements = item.querySelectorAll(".cases_item_text");

      textElements.forEach((textEl) => {
        if (textEl.textContent.trim().length > 0) {
          const split = new SplitText(textEl, { type: "lines" });
          const splitSecond = new SplitText(textEl, { type: "lines" });

          this.splits.push(split);

          gsap.set(splitSecond.lines, {
            overflow: "clip",
          });

          gsap.set(split.lines, { y: "120%" });
        }
      });
    });

    // Create timeline (no desktop/mobile distinction)
    this.tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power3.out" },
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
    const allTextLines = this.splits.map((split) => split.lines).flat();

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
    super.destroy();
  }
}
