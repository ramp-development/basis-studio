import App from "@app";
const app = App.getInstance();

export default class BaseAnimation {
  constructor(instance, reAnimate = false) {
    this.instance = instance;
    this.isVisible = false;
    this.reAnimate = reAnimate;
    this.hasAnimated = false;

    this.setupObserver();
    app.on("destroy", () => this.destroy());
  }

  setupObserver() {
    // Use the dedicated animation observer
    app.animationObserver.instance.observe(this.instance);
    this.startVisibilityCheck();
  }

  startVisibilityCheck() {
    // Simple polling to check if container is visible
    const check = () => {
      const isVisible = this.instance.dataset.animationVisible === "true";

      if (isVisible && !this.isVisible) {
        // Don't animate during page transitions
        if (app.isTransitioning) return;

        // Only animate if reAnimate is true OR if we haven't animated yet
        if (this.reAnimate || !this.hasAnimated) {
          this.animateIn();
        }
      } else if (!isVisible && this.isVisible && this.reAnimate) {
        this.animateOut();
      }

      requestAnimationFrame(check);
    };

    check();
  }

  // Override these in child classes
  animateIn() {
    this.isVisible = true;
    this.hasAnimated = true;
  }

  animateOut() {
    this.isVisible = false;
  }

  destroy() {
    // Override in child classes for cleanup
  }
}
