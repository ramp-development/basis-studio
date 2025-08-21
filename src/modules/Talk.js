import { gsap, SplitText, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default class Talk {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.title = this.instance.querySelector(".talk_title");
    this.list = this.instance.querySelector(".talk_item");
    this.items = this.list.querySelectorAll(".f-96");

    this.destroyed = false;
    this.titleHidden = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    // SplitText for title animation
    // this.titleSplit = new SplitText(this.title, {
    //   type: "chars, words",
    //   charsClass: "char",
    //   wordsClass: "word",
    // });

    this.split = new SplitText(this.title, {
      type: "lines",
    });
    this.splitSecond = new SplitText(this.title, {
      type: "lines",
    });
    gsap.set(this.splitSecond.lines, {
      overflow: "clip",
      paddingBottom: "0.1em",
      marginBottom: "-0.1em",
      perspective: 1000,
    });

    // Calculate and apply 3D cylinder positions
    this.calculatePositions();

    // Setup title animation first
    this.setupTitleAnimation();

    // Setup ScrollTrigger for cylinder rotation
    this.setupScrollAnimation();
  }

  calculatePositions() {
    // Responsive radius based on viewport size
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4; // 40% of smaller viewport dimension

    // Increased spacing for more breathing room
    const spacing = 16; // degrees (was 12)

    this.items.forEach((item, index) => {
      const angle = index * spacing * (Math.PI / 180); // Convert to radians
      const rotationAngle = index * -spacing; // Negative rotation as in example

      // Calculate positions - no problematic X offset, keep centered
      const x = 0; // Keep centered horizontally
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Apply transform
      item.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotationAngle}deg)`;
    });
  }

  setupTitleAnimation() {
    // Create timeline for title animation
    this.titleTl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    // Set initial state and animate to visible
    this.titleTl.fromTo(
      this.split.lines,
      {
        y: "120%",
        rotateX: "-65deg",
        transformStyle: "preserve-3d",
        transformOrigin: "center bottom",
      },
      {
        y: "0%",
        rotateX: "0deg",
        stagger: 0.1,
      }
    );

    // ScrollTrigger for title animation - trigger on enter and re-enter
    this.titleScrollTrigger = ScrollTrigger.create({
      trigger: this.title,
      start: "top 85%",
      onEnter: () => this.titleTl.play(),
      onLeaveBack: () => this.titleTl.reverse(),
      onEnterBack: () => this.titleTl.play(),
    });
  }

  setupScrollAnimation() {
    // Pin when title reaches center, then animate cylinder
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.title, // Use title as trigger point
      start: "center center", // Pin when title is centered
      end: "+=1850vh", // Longer scroll distance for slower animation
      pin: this.instance,
      scrub: 2,
      animation: gsap.fromTo(
        this.list,
        { rotateX: -80 }, // Start with text visible
        { rotateX: 270, ease: "none" } // Complete cylinder rotation
      ),
      onUpdate: (self) => {
        // Hide title after minimal progress to avoid collision
        if (self.progress > 0.001 && !this.titleHidden) {
          this.hideTitleAnimation();
          this.titleHidden = true;
        } else if (self.progress <= 0.001 && this.titleHidden) {
          this.showTitleAnimation();
          this.titleHidden = false;
        }

        // Decrease video opacity during rotation for better text visibility
        // Mobile: start fading earlier for better text visibility
        const mobileProgress = Math.max(0, self.progress - 0.1); // Start 10% earlier
        const desktopProgress = self.progress;

        const mobileOpacity = 1.0 - mobileProgress * 0.8; // Fade more aggressively
        const desktopOpacity = 1.0 - desktopProgress * 0.7;

        const mobileFinalOpacity = Math.max(0.2, mobileOpacity);
        const desktopFinalOpacity = Math.max(0.3, desktopOpacity);

        if (window.innerWidth >= 991) {
          // Desktop: 3D WebGL videos - control via uAlpha uniform
          if (this.app.gl?.world?.video?.meshs) {
            this.app.gl.world.video.meshs.forEach((meshData, index) => {
              // Check if this is a .talk_full mesh
              if (meshData.item?.classList.contains("talk_full")) {
                if (meshData.material?.uniforms?.uAlpha) {
                  meshData.material.uniforms.uAlpha.value = desktopFinalOpacity;
                }
              }
            });
          }
        } else {
          // Mobile: target .talk_full instead of individual videos
          const talkFull = document.querySelector(".talk_full");
          if (talkFull) {
            talkFull.style.opacity = mobileFinalOpacity;
          }
        }
      },
    });

    // Fix mobile interaction blocking by disabling pointer events on talk_item
    this.list.style.pointerEvents = "none";
  }

  hideTitleAnimation() {
    // Animate title out with same 3D effect but reversed
    gsap.to(this.split.lines, {
      y: "-120%",
      rotateX: "65deg",
      duration: 0.6,
      ease: "power3.in",
    });
  }

  showTitleAnimation() {
    // Animate title back in
    gsap.to(this.split.lines, {
      y: "0%",
      rotateX: "0deg",
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.05,
    });
  }

  resize() {
    if (this.destroyed) return;

    // Recalculate positions on resize for responsiveness
    this.calculatePositions();

    // Kill and recreate ScrollTrigger to handle mobile/desktop switch
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.setupScrollAnimation();
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    // Clean up ScrollTriggers
    if (this.titleScrollTrigger) {
      this.titleScrollTrigger.kill();
    }
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    // Clean up SplitText
    if (this.titleSplit) {
      this.titleSplit.revert();
    }
  }
}
