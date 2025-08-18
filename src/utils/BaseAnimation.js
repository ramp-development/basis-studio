export default class BaseAnimation {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;
    this.isVisible = false;
    
    this.setupObserver();
    this.app.on("destroy", () => this.destroy());
  }
  
  setupObserver() {
    // Use the dedicated animation observer
    this.app.animationObserver.instance.observe(this.instance);
    this.startVisibilityCheck();
  }
  
  startVisibilityCheck() {
    // Simple polling to check if container is visible
    const check = () => {
      const isVisible = this.instance.dataset.animationVisible === 'true';
      
      if (isVisible && !this.isVisible) {
        this.animateIn();
      } else if (!isVisible && this.isVisible) {
        this.animateOut();
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  }

  // Override these in child classes
  animateIn() {
    this.isVisible = true;
  }

  animateOut() {
    this.isVisible = false;
  }

  destroy() {
    // Override in child classes for cleanup
  }
}