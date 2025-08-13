import { gsap, ScrollTrigger, Draggable, InertiaPlugin } from "gsap/all";
import { LoadImages } from "@utils/LoadImages.js";
import VideoLoader from "@utils/VideoLoader.js";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

export default class Marquee {
  constructor(instance, app, main) {
    this.instance = instance;
    this.app = app;
    this.main = main;
    this.scroll = this.app.scroll.lenis;
    this.observer = this.app.observer.instance;

    this.destroyed = false;

    this.multiDirection = this.instance.dataset.direction === "1" ? 1 : -1;
    this.direction = 1 * this.multiDirection;
    this.prevDirection = this.direction;
    this.velocity = { value: 0 };
    this.enter = { value: 1 };
    this.move = 0;
    this.draggableMove = { value: 0 };
    this.draggableVelocity = 0;

    this.proxy = document.createElement("div");
    this.props = gsap.getProperty(this.proxy);

    this.wrappers = this.instance.querySelectorAll("[wrapper]");
    this.items = this.instance.querySelectorAll("[item]");

    this.setupCardVisibility();

    this.partLength = this.items.length / this.wrappers.length;
    this.newOrderItems = [
      ...Array.from(this.items).slice(this.partLength / 2),
      ...Array.from(this.items).slice(0, this.partLength / 2),
    ];

    LoadImages(this.instance);

    this.quicks = [...this.wrappers].map((el) =>
      gsap.quickSetter(el, "x", "%")
    );
    this.draggbleQuick = gsap.quickTo(this.draggableMove, "value", {
      duration: 0.2,
      ease: "power2",
    });
    this.changeVelocity = gsap.quickTo(this.velocity, "value", {
      duration: 0.2,
      ease: "power2",
    });

    this.scroll.on("scroll", (e) => {
      if (this.destroyed || this.instance.dataset.visible == "false") return;
      this.changeVelocity(Math.abs(e.velocity));
      if (this.prevDirection === e.direction) return;
      this.direction = e.direction * this.multiDirection;

      this.prevDirection = e.direction;
    });

    this.initDraggable();

    this.observer.observe(this.instance);

    this.wrappers.forEach((wrapper) => {
      wrapper.addEventListener("mouseenter", () => {
        this.enterTl?.kill();
        this.enterTl = gsap.to(this.enter, {
          value: 0,
          duration: 0.6,
          ease: "power3",
        });
      });
      wrapper.addEventListener("mouseleave", () => {
        this.enterTl?.kill();
        this.enterTl = gsap.to(this.enter, {
          value: 1,
          duration: 0.6,
          ease: "power3",
        });
      });
    });

    this.revealed = false;

    // OLD REVEAL TIMELINE - commented for easy rollback
    // this.revealTl = gsap.timeline({paused: true, defaults: {duration: 1, ease: 'power3'}})

    // NEW REVEAL TIMELINE - enhanced entrance effect
    this.revealTl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power3.out" },
    });
    // OLD REVEAL ANIMATION - commented for easy rollback
    // this.revealTl.fromTo(this.newOrderItems, {y: 40, autoAlpha: 0}, {y: 0, autoAlpha: 1, stagger: 0.05, onComplete: () => this.revealed = true})

    // PREVIOUS REVEAL ANIMATION - commented for easy rollback
    // this.revealTl.fromTo(
    //   this.newOrderItems,
    //   {
    //     x: 100, // Cards start from right
    //     y: 150, // Cards start from bottom
    //     opacity: 0,
    //     scale: 0.9,
    //     // rotationX: 15,
    //   },
    //   {
    //     x: 0, // Cards settle to center
    //     y: 0, // Cards move to normal position
    //     opacity: 1,
    //     scale: 1,
    //     // rotationX: 0,
    //     stagger: 0.08,
    //     onComplete: () => (this.revealed = true),
    //   }
    // );

    // CLIENT'S FRIEND WEBSITE EFFECT - 3D rotation reveal
    gsap.set(this.newOrderItems, { transformOrigin: "bottom" });
    this.revealTl.fromTo(
      this.newOrderItems,
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
        onComplete: () => (this.revealed = true),
      }
    );

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.wrappers[0],
      start: "top 80%",
      onEnter: () => {
        if (!this.revealed) this.revealTl.play();
      },
    });

    this.app.on("tick", () => this.tick());
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  initDraggable() {
    this.draggable = Draggable.create(this.proxy, {
      type: "x",
      inertia: true,
      trigger: this.instance,
      onDrag: () => {
        if (this.destroyed) return;
        this.draggbleQuick(this.draggable[0].deltaX);
      },
      onThrowUpdate: () => {
        if (this.destroyed) return;
        this.draggbleQuick(this.draggable[0].deltaX);
      },
    });
  }

  tick() {
    if (this.destroyed || this.instance.dataset.visible == "false") return;

    this.quicks.forEach((quick) => quick(this.move));
    const velocity = gsap.utils.mapRange(0, 100, 0, 1, this.velocity.value);
    const oldMove = this.move;
    this.move +=
      this.direction * (0.05 + velocity) * this.enter.value +
      this.draggableMove.value / 10;

    // COMMENTED OUT - Removing 3D testimonials connection for testing
    // if(this.instance.querySelector('.testimonials') && this.app.gl?.world?.testimonialsMesh) {
    //     const speed = Math.abs(this.move - oldMove) * 5 // Amplify movement for distortion effect
    //     this.app.gl.world.testimonialsMesh.setCarouselPosition(speed)
    // }

    this.draggbleQuick(0);

    if (this.move > 100 || this.move < -100) this.move = 0;

    this.changeVelocity(0);
  }

  resize() {
    if (this.destroyed) return;
  }

  setupCardVisibility() {
    this.items.forEach((card) => {
      const imageContainer = card.querySelector(".s-card_image");
      const videoContainer = card.querySelector(".s-card_video");

      if (!imageContainer || !videoContainer) return;

      const video = videoContainer.querySelector("video");
      const videoSource = videoContainer.querySelector("source");
      if (!videoSource || !video) return;

      const hasVideoSrc =
        videoSource.getAttribute("data-src") &&
        videoSource.getAttribute("data-src").trim() !== "";

      if (hasVideoSrc) {
        imageContainer.style.display = "none";
        videoContainer.style.display = "block";

        const videoLoader = new VideoLoader(video);
        videoLoader.on("error", () => {
          console.warn("Video failed to load, falling back to image");
          imageContainer.style.display = "block";
          videoContainer.style.display = "none";
        });
      } else {
        imageContainer.style.display = "block";
        videoContainer.style.display = "none";
      }
    });
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
  }
}
