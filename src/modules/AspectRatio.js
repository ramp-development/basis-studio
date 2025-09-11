export default class AspectRatio {
  constructor(element, main, app) {
    this.element = element; // The element with data-module
    this.main = main; // The main container
    this.app = app; // The app instance

    this.destroyed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    // Initialize module
    const aspect = this.getCustomAspectRatio();
    this.element.style.aspectRatio = aspect.ratio;
  }

  resize() {
    // Handle resize events
    if (this.destroyed) return;
  }

  destroy() {
    // Clean up when module is destroyed
    if (this.destroyed) return;
    this.destroyed = true;
  }

  getCustomAspectRatio() {
    // Try data attributes first (priority: mobile-specific > desktop > fallback)
    const mobileAspect = this.element.dataset.aspectMobile;
    const desktopAspect = this.element.dataset.aspect;

    let aspectValue;
    let source;

    if (this.isMobile && mobileAspect) {
      aspectValue = mobileAspect;
      source = "data-aspect-mobile";
    } else if (desktopAspect) {
      aspectValue = desktopAspect;
      source = "data-aspect";
    }

    if (aspectValue) {
      // Parse aspect ratio (support formats like "16:9", "1.78", "16/9")
      const parsed = this.parseAspectRatio(aspectValue);
      if (parsed) {
        return {
          width: parsed.width,
          height: parsed.height,
          ratio: parsed.ratio,
          source,
        };
      }
    }

    // Fallback: try to get aspect ratio from CSS
    const cssAspect = this.getAspectRatioFromCSS(this.element);
    if (cssAspect) {
      return {
        width: cssAspect.width,
        height: cssAspect.height,
        ratio: cssAspect.ratio,
        source: "CSS aspect-ratio",
      };
    }

    return null;
  }

  parseAspectRatio(aspectString) {
    if (!aspectString) return null;

    // Handle "16:9" or "1739:1303" format
    if (aspectString.includes(":")) {
      const [width, height] = aspectString.split(":").map(Number);
      if (width && height) {
        return {
          width,
          height,
          ratio: width / height,
        };
      }
    }

    // Handle "16/9" or "1739/1303" format
    if (aspectString.includes("/")) {
      const [width, height] = aspectString.split("/").map(Number);
      if (width && height) {
        return {
          width,
          height,
          ratio: width / height,
        };
      }
    }

    // Handle decimal format "1.78" - can't extract width/height
    const ratio = parseFloat(aspectString);
    if (!isNaN(ratio) && ratio > 0) {
      return {
        ratio,
        width: null,
        height: null,
      };
    }

    return null;
  }
}
