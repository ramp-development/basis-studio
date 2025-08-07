import { gsap, ScrollTrigger, SplitText } from "@utils/GSAP.js";

export default class FullBleed {
  constructor(instance, app, main) {
    this.instance = instance;
    this.app = app;
    this.main = main;

    // this.world = this.app.gl.world
    this.destroyed = false;

    this.wrapper = this.instance.querySelector(".full_wrapper");
    this.items = this.instance.querySelectorAll(".full_item");

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.splits = [];
    this.scrolls = [];

    // OLD HEIGHT - commented for easy rollback
    // gsap.set(this.wrapper, {height: this.items.length * 100 + 'vh'})

    // EXTENDED HEIGHT - much more space for each video to dwell
    gsap.set(this.wrapper, { height: this.items.length * 100 + 100 + "vh" });
    ScrollTrigger.refresh();

    this.height = this.instance.getBoundingClientRect().height;
    // OLD TIMING - commented for easy rollback
    // this.itemPart = this.height / (this.items.length + 1)

    // EXTENDED TIMING - much longer duration per video
    this.itemPart = this.height / (this.items.length + 0.5);

    this.items.forEach((item, index) => {
      const title = item.querySelector(".f-64");
      const descr = item.querySelector("p");
      const video = item.querySelector("video");

      const splitTitle = new SplitText(title, {
        type: "lines",
        linesClass: "full_line",
      });
      const splitTitleParent = new SplitText(title, {
        type: "lines",
        linesClass: "full_line-parent",
      });
      const splitDescr = new SplitText(descr, {
        type: "lines",
        linesClass: "full_line",
      });
      const splitDescrParent = new SplitText(descr, {
        type: "lines",
        linesClass: "full_line-parent",
      });

      this.splits.push(splitDescr, splitTitle, splitDescrParent);

      // Setup line animation like LineAnimation.js
      const lineParents = [
        ...splitDescrParent.lines,
        ...splitTitleParent.lines,
      ];
      const lines = [...splitDescr.lines, ...splitTitle.lines];

      // Set up parent lines with overflow hidden and perspective
      gsap.set(lineParents, {
        overflow: "hidden",
        perspective: 1000,
        perspectiveOrigin: "center center",
      });

      // Set up child lines with initial 3D state (only when active)
      gsap.set(lines, {
        y: "120%",
        rotateX: "-45deg",
        transformOrigin: "center bottom",
        transformStyle: "preserve-3d",
      });

      // Create timeline for text animation
      const textTl = gsap.timeline({ paused: true });
      textTl.to(lines, {
        y: "0%",
        rotateX: "0deg",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });

      // Store timeline for later use
      item.textTl = textTl;

      splitDescr.lines.forEach((line, index) => {
        const delay = index * 0.1 + 0.1;
        line.style.setProperty("--delay", delay + "s");
      });

      splitTitle.lines.forEach((line, index) => {
        const delay = index * 0.1 + 0.1;
        line.style.setProperty("--delay", delay + "s");
      });

      // Setup mobile 3D animation for videos
      if (video && window.innerWidth <= 991) {
        // Set up 3D perspective on parent
        gsap.set(video.parentElement, {
          perspective: 1000,
          perspectiveOrigin: "center center",
        });

        gsap.set(video, {
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
          opacity: 0,
          rotationZ: -18,
          rotationY: 45,
          rotationX: -45,
          scale: 0.4,
        });

        // Create timeline for mobile video animation
        const mobileTl = gsap.timeline({ paused: true });
        mobileTl.to(video, {
          opacity: 1,
          rotationZ: 0,
          rotationY: 0,
          rotationX: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        });

        // Store timeline for later use
        item.mobileTl = mobileTl;
      }

      this.scrolls[index] = ScrollTrigger.create({
        trigger: item,
        start: `top center-=${this.itemPart * index}`,
        end: `+=${this.itemPart}`,
        onEnter: () => {
          // Reset all items and their text animations
          this.items.forEach((el) => {
            el.classList.remove("active");
            if (el.textTl) {
              el.textTl.pause(0); // Reset to start
            }
          });

          item.classList.add("active");
          item.classList.add("show-bg");

          // Play text animation only for active item
          if (item.textTl) {
            item.textTl.play();
          }

          if (window.innerWidth < 991) {
            // Mobile: hide all videos and reset their animations
            this.items.forEach((el) => {
              const video = el.querySelector("video");
              if (video && el.mobileTl) {
                el.mobileTl.pause(0);
              }
            });
            // Show current video with 3D animation
            if (item.mobileTl) {
              item.mobileTl.play();
            }
            return;
          }
          this.app.gl.world.full.meshs[index].tl.play();
        },
        onEnterBack: () => {
          // Reset all items and their text animations
          this.items.forEach((el) => {
            el.classList.remove("active");
            if (el.textTl) {
              el.textTl.pause(0); // Reset to start
            }
          });

          item.classList.add("active");

          // Play text animation only for active item
          if (item.textTl) {
            item.textTl.play();
          }

          if (window.innerWidth < 991) {
            // Mobile: reset all animations and play current
            this.items.forEach((el) => {
              if (el.mobileTl) {
                el.mobileTl.pause(0);
              }
            });
            if (item.mobileTl) {
              item.mobileTl.play();
            }
            return;
          }
        },
        onLeaveBack: () => {
          item.classList.remove("show-bg");

          // Reverse text animation
          if (item.textTl) {
            item.textTl.reverse();
          }

          if (window.innerWidth < 991) {
            // Mobile: reverse animation to hide video
            if (item.mobileTl) {
              item.mobileTl.reverse();
            }
            return;
          }
          this.app.gl.world.full.meshs[index].tl.reverse();
        },
      });
    });
  }

  resize() {
    if (this.destroyed) return;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
