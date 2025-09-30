import App from "@app";
const app = App.getInstance();

export default class Popup {
  constructor(instance, main) {
    this.instance = instance;
    this.main = main;
    this.scroll = app.scroll.lenis;

    this.bodyMain = document.body;
    this.close = this.instance.querySelector(".btn");
    this.body = this.instance.querySelector(".popup_body");
    this.overlay = this.instance.querySelector(".popup_overlay");

    this.isAnimating = false;
    this.isOpen = false;

    this.init();
  }

  init() {
    this.enterTl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power2" },
      onStart: () => {
        this.isAnimating = true;
        this.instance.classList.add("active");

        this.scroll.stop();
        this.bodyMain.classList.add("hide-nav");

        // Lower canvas z-index when popup opens
        this.handleCanvasZIndex(false);
      },
      onComplete: () => {
        this.isAnimating = false;
        this.isOpen = true;
      },
    });

    this.enterTl
      .fromTo(
        this.body,
        { yPercent: 100, scale: 0.9, opacity: 1 },
        { opacity: 1, yPercent: 0, scale: 1, overwrite: "auto" }
      )
      .fromTo(
        this.overlay,
        { opacity: 0 },
        { opacity: 1, overwrite: "auto" },
        "<"
      );

    this.initButtons();

    this.leaveTl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.6, ease: "power2" },
      onStart: () => {
        this.isAnimating = true;
        this.scroll.start();
        this.bodyMain.classList.remove("hide-nav");
      },
      onComplete: () => {
        this.isAnimating = false;
        this.isOpen = false;
        this.instance.classList.remove("active");

        // Restore canvas z-index when popup closes (only if on case study)
        this.handleCanvasZIndex(true);
      },
    });

    this.leaveTl
      .to(this.body, { opacity: 0, overwrite: "auto" })
      .to(this.overlay, { opacity: 0, overwrite: "auto" }, "<");

    this.close.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closePopup();
    });

    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.closePopup();
      }
    });
  }

  initButtons() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest('[data-popup-trigger="true"]');
      if (!trigger) return;

      event.preventDefault();
      this.openPopup();
    });
    // this.btns = this.bodyMain.querySelectorAll('[data-popup-trigger="true"]');
    // this.btns.forEach((btn) =>
    //   btn.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     this.openPopup();
    //   })
    // );
  }

  openPopup() {
    if (this.isAnimating || this.isOpen) return;
    this.enterTl.restart();
  }

  closePopup() {
    if (this.isAnimating || !this.isOpen) return;
    this.leaveTl.restart();
  }

  handleCanvasZIndex(restore) {
    const canvasContainer = document.querySelector(".canvas-container");
    if (!canvasContainer) return;

    const isCaseStudy =
      document.querySelector("main").dataset.transitionPage === "case-inner";

    if (restore && isCaseStudy) {
      // Restore to case study z-index when popup closes
      canvasContainer.style.zIndex = "2";
    } else {
      // Lower canvas when popup opens or when not on case study
      canvasContainer.style.zIndex = "-1";
    }
  }
}
