import { gsap, SplitText, ScrollTrigger } from "gsap/all";
import { def } from "@utils/GSAP.js";

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
    this.titleSplit = new SplitText(this.title, { 
      type: 'chars, words', 
      charsClass: 'char', 
      wordsClass: 'word' 
    });

    // Calculate and apply 3D cylinder positions
    this.calculatePositions();

    // Setup title animation first
    this.setupTitleAnimation();

    // Setup ScrollTrigger for cylinder rotation
    this.setupScrollAnimation();

    console.log(
      "Talk module initialized - Title animation + 3D cylinder with ScrollTrigger rotation"
    );
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
    this.titleTl = gsap.timeline({ paused: true, defaults: { 
      ease: 'power3', 
      duration: def.duration, 
      stagger: { from: 'center', each: def.stagger } 
    }});

    // Set initial state and animate to visible
    this.titleTl.fromTo(this.titleSplit.chars, 
      { opacity: 0, filter: 'blur(15px)' }, 
      { opacity: 1, filter: 'blur(0px)' }
    );

    // ScrollTrigger for title animation - from top of viewport to center
    this.titleScrollTrigger = ScrollTrigger.create({
      trigger: this.title,
      start: 'top 80%',
      end: 'center center',
      scrub: true,
      animation: this.titleTl,
      markers: { startColor: "blue", endColor: "blue", fontSize: "12px", fontWeight: "bold", indent: 20 }
    });
  }

  setupScrollAnimation() {
    // Pin when title reaches center, then animate cylinder
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.title, // Use title as trigger point
      start: "center center", // Pin when title is centered
      end: "+=150vh", // Longer scroll distance for slower animation
      pin: this.instance, // Pin the entire section
      markers: true,
      scrub: 2,
      animation: gsap.fromTo(
        this.list,
        { rotateX: -80 }, // Start with text visible
        { rotateX: 270, ease: "none" } // Complete cylinder rotation
      ),
      onUpdate: (self) => {
        console.log(
          `Cylinder rotation progress: ${(self.progress * 100).toFixed(1)}%`
        );
      },
    });
  }

  resize() {
    if (this.destroyed) return;

    // Recalculate positions on resize for responsiveness
    this.calculatePositions();

    console.log("Talk module resize - recalculated 3D positions");
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
