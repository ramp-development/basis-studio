import { gsap, SplitText, ScrollTrigger } from "gsap/all";
import { def } from "@utils/GSAP.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default class Talk {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    this.list = this.instance.querySelector(".talk_item");
    this.items = this.list.querySelectorAll(".f-96");

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    // Original SplitText logic - commented out for 3D cylinder testing
    // this.splits = [...this.items].map(item =>
    // {
    //     return new SplitText(item, { type: 'chars, words', charsClass: 'char', wordsClass: 'word' })
    // })

    // this.tls = [...this.items].map((item, index) =>
    // {
    //     const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3', duration: def.duration, stagger: { from: 'center', each: def.stagger } } })

    //     tl.fromTo(this.splits[index].chars, { opacity: 0, filter: 'blur(15px)' }, { opacity: 1, filter: 'blur(0px)' })

    //     const scroll = ScrollTrigger.create(
    //     {
    //         trigger: item,
    //         start: 'top 80%',
    //         end: 'center center',
    //         scrub: true,
    //         animation: tl,
    //     })

    //     const height = item.getBoundingClientRect().height

    //     const centerScroll = ScrollTrigger.create(
    //     {
    //         trigger: item,
    //         start: `center center`,
    //         end: `+=${height * 0.5}`,
    //         onEnter: () =>
    //         {
    //             this.items.forEach(i => i.classList.remove('active'))
    //             item.classList.add('active')
    //         },
    //         onEnterBack: () =>
    //         {
    //             this.items.forEach(i => i.classList.remove('active'))
    //             item.classList.add('active')
    //         },
    //     })

    //     return { tl, scroll, centerScroll }
    // })

    // Calculate and apply 3D cylinder positions
    this.calculatePositions();

    // Setup ScrollTrigger for cylinder rotation
    this.setupScrollAnimation();

    console.log(
      "Talk module initialized - 3D cylinder with ScrollTrigger rotation"
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

  setupScrollAnimation() {
    // Pin the container and rotate the cylinder
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.instance, // Pin the entire section
      start: "top top",
      end: "+=200vh", // Much longer scroll for slower rotation
      pin: true,
      markers: true,
      scrub: 2, // Slower scrub for more control
      animation: gsap.fromTo(
        this.list,
        { rotateX: -30 }, // Start with text visible (less rotation)
        { rotateX: 270, ease: "none" } // End rotation (extended range)
      ),
      onUpdate: (self) => {
        // Optional: log progress for debugging
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

    // Clean up ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
  }
}
