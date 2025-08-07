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

    // Spacing matches example website pattern
    const spacing = 12; // degrees

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
    });

    // Fix mobile interaction blocking by disabling pointer events on talk_item
    this.list.style.pointerEvents = "none";
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
