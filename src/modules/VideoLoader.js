import EventEmitter from "@utils/EventEmitter.js";

export default class VideoLoader extends EventEmitter {
  constructor(videoElement, app, options = {}) {
    super();

    // Handle both old signature (videoElement, options) and new (videoElement, app, options)
    // If app looks like an options object (has VideoLoader-specific properties), it's the old signature
    if (
      app &&
      typeof app === "object" &&
      !app.moduleLoader && // ModuleLoader app should have this
      !app.scroll && // App should have scroll property
      (app.timeout ||
        app.lazyLoad !== undefined ||
        app.rootMargin ||
        app.threshold)
    ) {
      // Old signature: (videoElement, options)
      options = app;
      app = null;
    }

    // Handle both cases: data-module on wrapper div OR directly on video element
    this.video =
      videoElement.tagName === "VIDEO"
        ? videoElement
        : videoElement.querySelector("video");
    this.instance = videoElement; // Keep reference to original element passed by ModuleLoader
    this.app = app;
    this.options = {
      timeout: options.timeout || 15000,
      lazyLoad: options.lazyLoad !== false, // Default to true
      rootMargin: options.rootMargin || "100px",
      threshold: options.threshold || 0.1,
    };

    this.isLoaded = false;
    this.isInView = false;
    this.observer = null;
    this.loadingIndicator = null;

    // Device detection
    this.isMobile = window.innerWidth <= 992;
    this.isLowPowerMode = this.detectLowPowerMode();

    // Store reference for WebGL coordination
    this.video._videoLoaderInstance = this;

    // Determine if this video needs WebGL treatment
    this.isWebGLVideo = this.detectWebGLVideo();

    this.source = this.video.querySelector("source");
    const mobileUrl =
      this.source.getAttribute("data-src-mobile") ||
      this.source.dataset.srcMobile;
    const desktopUrl =
      this.source.getAttribute("data-src") || this.source.dataset.src;
    this.src = this.isMobile && mobileUrl ? mobileUrl : desktopUrl;

    // Don't set src immediately if lazy loading (unless WebGL needs it)
    if (!this.options.lazyLoad || this.isWebGLVideo) {
      this.source.setAttribute("src", this.src);
    }
    // Initialize
    this.init();
  }

  detectWebGLVideo() {
    // Check if video is inside WebGL-targeted elements
    const webglSelectors = [
      ".double-video",
      ".cases_video",
      ".preview_img",
      ".talk_full",
    ];

    // If data-module is on video element, check parent containers
    // If data-module is on wrapper, check the wrapper itself
    const elementToCheck =
      this.video === this.instance ? this.video.parentElement : this.instance;

    return webglSelectors.some((selector) => {
      const className = selector.substring(1);
      // Check the element itself
      if (elementToCheck && elementToCheck.classList.contains(className))
        return true;
      // Check parent elements up the tree
      let parent = elementToCheck?.parentElement;
      while (parent) {
        if (parent.classList.contains(className)) return true;
        parent = parent.parentElement;
      }
      return false;
    });
  }

  getCustomAspectRatio() {
    // Selectors that support custom aspect ratios
    const aspectSelectors = [".double-video", ".case_split-video"];

    // Find the container element
    const elementToCheck =
      this.video === this.instance ? this.video.parentElement : this.instance;

    // Check if video is in a container that supports custom aspect ratios
    const container = this.findContainerWithClass(
      elementToCheck,
      aspectSelectors
    );
    if (!container) return null;

    // Try data attributes first (priority: mobile-specific > desktop > fallback)
    const mobileAspect = container.dataset.aspectMobile;
    const desktopAspect = container.dataset.aspect;

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
    const cssAspect = this.getAspectRatioFromCSS(container);
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

  findContainerWithClass(element, selectors) {
    let current = element;
    while (current) {
      for (const selector of selectors) {
        const className = selector.substring(1);
        if (current.classList && current.classList.contains(className)) {
          return current;
        }
      }
      current = current.parentElement;
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

  getAspectRatioFromCSS(element) {
    try {
      const computedStyle = window.getComputedStyle(element);
      const aspectRatio = computedStyle.getPropertyValue("aspect-ratio");

      if (!aspectRatio || aspectRatio === "auto") return null;

      // Parse CSS aspect-ratio value (e.g., "359 / 269", "16 / 9", "1.78")
      return this.parseAspectRatio(aspectRatio.replace(/\s+/g, ""));
    } catch (error) {
      console.warn("Failed to read CSS aspect-ratio:", error);
      return null;
    }
  }

  init() {
    // Check if video is already loaded
    if (this.video.readyState >= 3) {
      this.isLoaded = true;
      this.trigger("loaded");
      this.setupDOMPlayback();
      return;
    }

    // On mobile: force lazy loading for ALL videos to prevent crashes
    // On desktop: WebGL videos load immediately, others use lazy loading
    if (!this.isMobile && (this.isWebGLVideo || !this.options.lazyLoad)) {
      this.startLoading();
    } else {
      this.setupIntersectionObserver();
    }
  }

  detectLowPowerMode() {
    // Check for reduced motion preference (often indicates low power mode)
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return true;
    }

    // Check connection type if available
    if (navigator.connection) {
      const connection = navigator.connection;
      return (
        connection.saveData ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      );
    }

    return false;
  }

  setupIntersectionObserver() {
    if (!("IntersectionObserver" in window)) {
      // Fallback: load immediately if no intersection observer support
      this.startLoading();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isLoaded && !this.isInView) {
            this.isInView = true;
            this.startLoading();
          }
        });
      },
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold,
      }
    );

    this.observer.observe(this.video);
  }

  startLoading() {
    const startTime = performance.now();

    // Set video source if not set yet
    if (!this.source.getAttribute("src")) {
      this.source.setAttribute("src", this.src);
    }

    // Optimize preload based on device and network conditions
    this.setOptimalPreloadBehavior();

    // Force browser to load the video
    this.video.load();

    // Add event listeners
    this.addEventListeners();

    // Start timeout
    this.startTimeout();
  }

  setOptimalPreloadBehavior() {
    if (this.isMobile || this.isLowPowerMode) {
      // On mobile or low power mode: only load metadata first
      this.video.preload = "metadata";

      // Add user interaction listener to upgrade to auto
      this.setupUserInteractionUpgrade();
    } else {
      // On desktop with good connection: preload everything
      this.video.preload = "auto";
    }
  }

  setupUserInteractionUpgrade() {
    const upgradePreload = (eventType) => {
      this.video.preload = "auto";
      this.video.load();

      // Remove listeners after first interaction
      document.removeEventListener("touchstart", upgradePreload, {
        passive: true,
      });
      document.removeEventListener("scroll", upgradePreload, { passive: true });
      document.removeEventListener("click", upgradePreload);
    };

    // Upgrade preload on any user interaction
    document.addEventListener("touchstart", (e) => upgradePreload("touch"), {
      passive: true,
      once: true,
    });
    document.addEventListener("scroll", (e) => upgradePreload("scroll"), {
      passive: true,
      once: true,
    });
    document.addEventListener("click", (e) => upgradePreload("click"), {
      once: true,
    });
  }

  addEventListeners() {
    // Listen for when video can play through - means it's fully loaded
    this.video.addEventListener(
      "canplaythrough",
      () => {
        this.onVideoLoaded();
      },
      { once: true }
    );

    // Additional events to handle various scenarios
    this.video.addEventListener(
      "error",
      (e) => {
        this.onVideoError(e);
      },
      { once: true }
    );
  }

  startTimeout() {
    this.timeout = setTimeout(() => {
      if (!this.isLoaded) {
        console.warn("Video load timeout - proceeding anyway");
        this.onVideoLoaded(true);
      }
    }, this.options.timeout);
  }

  onVideoLoaded() {
    if (this.isLoaded) return;

    this.isLoaded = true;
    clearTimeout(this.timeout);

    // Disconnect observer to save memory
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Get custom aspect ratio if specified (mobile only)
    const customAspect = this.isMobile ? this.getCustomAspectRatio() : null;

    if (customAspect && customAspect.width && customAspect.height) {
      // Use explicit width/height values from aspect ratio (mobile only)
      this.width = customAspect.width;
      this.height = customAspect.height;
    } else {
      // Use natural video dimensions
      this.width = this.video.videoWidth;
      this.height = this.video.videoHeight;
    }

    // Handle DOM playback for non-WebGL videos
    this.setupDOMPlayback();

    // Trigger loaded event
    this.trigger("loaded");
  }

  setupDOMPlayback() {
    // Only handle DOM playback for non-WebGL videos
    if (!this.isWebGLVideo) {
      const autoplay = this.video.getAttribute("autoplay");
      if (autoplay === "true") {
        this.playVideo();
      } else {
        this.video.currentTime = 0;
        this.video.pause();
        this.playVideo();
      }
    }
    this.video.classList.add("loaded");
  }

  playVideo() {
    if (!this.video.paused) return;
    this.video.play().catch((error) => {
      console.warn("Video autoplay failed:", error);
    });
  }

  onVideoError(error) {
    clearTimeout(this.timeout);
    console.error("Error loading video:", error);

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Trigger error event
    this.trigger("error");
  }

  // Public methods
  waitForLoad() {
    return new Promise((resolve, reject) => {
      if (this.isLoaded) {
        resolve(this.video);
        return;
      }

      this.on("loaded", () => resolve(this.video));
      this.on("error", (data) => reject(data.error));
    });
  }

  // Cleanup method for better memory management
  destroy() {
    clearTimeout(this.timeout);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear WebGL coordination reference
    if (this.video) {
      this.video._videoLoaderInstance = null;
      // Pause video to save resources
      if (!this.video.paused) {
        this.video.pause();
      }
    }

    // Remove all event listeners
    this.off();

    // Clear references
    this.video = null;
    this.source = null;
  }

  // Static method for batch optimization
  static optimizeMultipleVideos(videos, options = {}) {
    const loaders = [];
    const mobileThreshold = options.mobileThreshold || 992;
    const isMobile = window.innerWidth <= mobileThreshold;

    // On mobile, stagger video loading to prevent overwhelming
    if (isMobile && videos.length > 3) {
      videos.forEach((video, index) => {
        setTimeout(() => {
          const loader = new VideoLoader(video, {
            ...options,
            lazyLoad: true,
            rootMargin: index < 2 ? "50px" : "200px", // Closer videos load sooner
          });
          loaders.push(loader);
        }, index * 500); // 500ms stagger
      });
    } else {
      videos.forEach((video) => {
        const loader = new VideoLoader(video, options);
        loaders.push(loader);
      });
    }

    return loaders;
  }
}
