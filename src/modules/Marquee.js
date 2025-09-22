import { LoadImages } from "@utils/LoadImages.js";
import VideoLoader from "@modules/VideoLoader.js";

export default class Marquee {
  constructor(instance, app, main) {
    this.instance = instance;
    this.app = app;
    this.main = main;
    this.scroll = this.app.scroll.lenis;
    this.observer = this.app.observer.instance;

    this.destroyed = false;

    // Check if parent element is hidden by Webflow and exit early if so
    const wHidden = "w-condition-invisible";
    if (this.instance.parentElement?.classList.contains(wHidden)) return;

    this.axis = this.instance.dataset.axis === "vertical" ? "y" : "x";
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

    // For vertical marquees, duplicate wrappers with data-duplicate attribute
    this.duplicateMarqueeWrappers();

    this.setupCardVisibility();

    this.partLength = this.items.length / this.wrappers.length;

    // Different logic for vertical vs horizontal marquees
    if (this.axis === "y") {
      // For vertical marquees: use original items order (duplication handles the layout)
      this.newOrderItems = Array.from(this.items);
    } else {
      // For horizontal marquees: use the original slice logic
      this.newOrderItems = [
        ...Array.from(this.items).slice(this.partLength / 2),
        ...Array.from(this.items).slice(0, this.partLength / 2),
      ];
    }

    LoadImages(this.instance);

    this.quicks = [...this.wrappers].map((el) =>
      gsap.quickSetter(el, this.axis, "%")
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

  duplicateMarqueeWrappers() {
    // Find elements with data-duplicate attribute within this marquee instance
    const elementsToduplicate =
      this.instance.querySelectorAll("[data-duplicate]");

    elementsToduplicate.forEach((element) => {
      const parent = element.parentNode;

      // Create two additional copies of the entire element
      for (let copy = 0; copy < 2; copy++) {
        const duplicatedElement = element.cloneNode(true);

        // // Add responsive margin based on axis direction
        // const isMobile = window.innerWidth <= 992;
        // const marginValue = isMobile ? "2.75rem" : "7.5rem";

        // if (this.axis === "y") {
        //   // Vertical marquee - use margin-top
        //   duplicatedElement.style.marginTop = marginValue;
        // } else {
        //   // Horizontal marquee - use margin-left
        //   duplicatedElement.style.marginLeft = marginValue;
        // }

        parent.appendChild(duplicatedElement);
      }
    });

    // Update wrappers and items references to include duplicated elements
    this.wrappers = this.instance.querySelectorAll("[wrapper]");
    this.items = this.instance.querySelectorAll("[item]");
  }

  initDraggable() {
    this.draggable = Draggable.create(this.proxy, {
      type: this.axis,
      inertia: true,
      trigger: this.instance,
      onDrag: () => {
        if (this.destroyed) return;
        const delta =
          this.axis === "y"
            ? this.draggable[0].deltaY
            : this.draggable[0].deltaX;
        this.draggbleQuick(delta);
      },
      onThrowUpdate: () => {
        if (this.destroyed) return;
        const delta =
          this.axis === "y"
            ? this.draggable[0].deltaY
            : this.draggable[0].deltaX;
        this.draggbleQuick(delta);
      },
    });
  }

  tick() {
    if (this.destroyed || this.instance.dataset.visible == "false") return;

    this.quicks.forEach((quick) => quick(this.move));
    const velocity = gsap.utils.mapRange(0, 100, 0, 1, this.velocity.value);
    const oldMove = this.move;
    this.move +=
      this.direction * (0.1 + velocity) * this.enter.value +
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
      const isMobile = window.innerWidth <= 992;

      // Handle .s-card_* classes (existing logic)
      const imageContainer = card.querySelector(".s-card_image");
      const videoContainer = card.querySelector(".s-card_video");

      if (imageContainer && videoContainer) {
        const video = videoContainer.querySelector("video");
        const videoSource = videoContainer.querySelector("source");
        if (videoSource && video) {
          const mobileUrl = videoSource.getAttribute("data-src-mobile");
          const desktopUrl = videoSource.getAttribute("data-src");
          const videoUrl = isMobile && mobileUrl ? mobileUrl : desktopUrl;
          const hasVideoSrc = videoUrl && videoUrl.trim() !== "";

          if (hasVideoSrc) {
            imageContainer.style.display = "none";
            videoContainer.style.display = "block";

            const videoLoader = new VideoLoader(video);
            videoLoader.on("error", () => {
              imageContainer.style.display = "block";
              videoContainer.style.display = "none";
            });
          } else {
            imageContainer.style.display = "block";
            videoContainer.style.display = "none";
          }
        }
      }

      // Handle .s-gallery_item classes (new logic)
      const galleryItem = card.querySelector(".s-gallery_item_wrapper");
      if (galleryItem) {
        // Set width and aspect-ratio based on layout
        const layout = galleryItem.dataset.layout;
        const isBig = layout === "big";

        const width = isMobile
          ? isBig
            ? "25rem"
            : "15rem"
          : isBig
            ? "45rem"
            : "30rem";

        const aspectRatio = isMobile
          ? isBig
            ? "395 / 295"
            : "238 / 295"
          : isBig
            ? "725 / 545"
            : "389 / 440";

        galleryItem.style.setProperty("width", width, "important");
        galleryItem.style.setProperty("aspect-ratio", aspectRatio, "important");

        // Handle gallery image and video containers
        const galleryImageContainer = card.querySelector(
          ".s-gallery_item_image"
        );
        const galleryVideoContainer = card.querySelector(
          ".s-gallery_item_video"
        );

        if (galleryImageContainer && galleryVideoContainer) {
          const galleryVideo = galleryVideoContainer.querySelector("video");
          const galleryVideoSource = galleryVideo?.querySelector("source");

          if (galleryVideoSource && galleryVideo) {
            const mobileUrl =
              galleryVideoSource.getAttribute("data-src-mobile");
            const desktopUrl = galleryVideoSource.getAttribute("data-src");
            const videoUrl = isMobile && mobileUrl ? mobileUrl : desktopUrl;
            const hasVideoSrc = videoUrl && videoUrl.trim() !== "";

            if (hasVideoSrc) {
              galleryImageContainer.style.display = "none";
              galleryVideoContainer.style.display = "block";

              const videoLoader = new VideoLoader(galleryVideo);
              videoLoader.on("error", () => {
                console.warn(
                  "Gallery video failed to load, falling back to image"
                );
                galleryImageContainer.style.display = "block";
                galleryVideoContainer.style.display = "none";
              });
            } else {
              galleryImageContainer.style.display = "block";
              galleryVideoContainer.style.display = "none";
            }
          }
        }
      }
    });
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
  }
}
