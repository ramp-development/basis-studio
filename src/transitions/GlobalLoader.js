import gsap from "gsap";

export default class GlobalLoader {
  constructor(container, toLoad, app) {
    this.app = app;
    this.toLoad = toLoad;
    this.main = container.container;
    this.container = container;

    this.app.globalLoader = this;

    this.loader = document.querySelector(".loader");
    this.nav = document.querySelector(".nav");
    this.navLogo = this.nav.querySelector(".nav_logo");
    this.navDots = this.nav.querySelector(".nav_dots");
    this.loaderText = this.loader.querySelectorAll(".f-48");
    this.loaderLayer = this.loader.querySelectorAll(".loader_layer");
    this.loaderLogo = this.loaderLayer[0].querySelector(".loader_logo");
    this.progress = { value: 0 };

    // Preloading system
    this.assetsToPreload = [];
    this.loadedAssets = 0;
    this.totalAssets = 0;
    this.preloadComplete = false;
    this.preloadProgress = 0;

    gsap.to([this.main], { autoAlpha: 1 });

    this.tl = gsap.timeline({
      defaults: { ease: "power2", duration: 1 },
      paused: true,
      onComplete: () => {
        this.loader.classList.add("loaded");
        this.loader.classList.add("hidden");
        gsap.to(this.nav, { autoAlpha: 1 });
      },
    });

    // this.tl.fromTo(this.loaderLayer, {'--clip': 0}, {'--clip': 70})
    this.tl
      .fromTo(
        this.progress,
        { value: 0 },
        {
          value: 70,
          onUpdate: () => this.updateTextProgress(),
          onComplete: () => this.load(),
        },
        0.2
      )
      .addLabel("start", ">")
      .to(
        this.progress,
        {
          value: 100,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: () => this.updateTextProgress(),
        },
        ">"
      )
      .fromTo(
        this.loader,
        { "--clip": 0 },
        { "--clip": 100, duration: 0.8 },
        "<0.5"
      );

    // Start preloading and animation simultaneously
    this.startPreloading();
    this.tl.tweenTo("start");
  }

  updateTextProgress() {
    // Pure fake progression - smooth and predictable for client
    const value = Math.round(this.progress.value);

    this.loaderText.forEach((text) => {
      text.textContent = value + "%";
    });

    this.loaderLayer[1].style.setProperty("--clip", this.progress.value);
  }

  async startPreloading() {
    // Discover assets to preload
    this.discoverAssets();

    if (this.totalAssets === 0) {
      this.preloadComplete = true;
      return Promise.resolve();
    }

    // Start preloading
    const preloadPromises = this.assetsToPreload.map((asset) =>
      this.preloadAsset(asset)
    );

    // Wait for all assets or timeout after 3 seconds
    return Promise.race([
      Promise.all(preloadPromises),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ]).then(() => {
      this.preloadComplete = true;
    });
  }

  discoverAssets() {
    const isMobile = window.innerWidth <= 992;

    // Discover critical images (hero images, above-fold content)
    const heroImages = this.main.querySelectorAll(
      'img[src*="hero"], .hero img, .h-home_hero img, .h-services_bg img, hero_image img'
    );
    heroImages.forEach((img) => {
      if (img.src && !img.complete) {
        this.assetsToPreload.push({
          type: "image",
          url: img.src,
          element: img,
        });
      }
    });

    // Discover critical videos - but coordinate with VideoLoader
    const heroVideos = this.main.querySelectorAll(
      '.hero video[data-module="VideoLoader"], .h-home_hero video[data-module="VideoLoader"]'
    );

    heroVideos.forEach((video) => {
      // Check if this video should be preloaded (hero/above-fold only)
      const isHeroVideo = video.closest(
        ".hero, .h-home_hero, .h-services_hero, .h-services_bg, .h-services"
      );

      if (isHeroVideo) {
        this.assetsToPreload.push({ type: "video-coordinate", element: video });
      }
    });

    // Discover background images from CSS
    const elementsWithBg = this.main.querySelectorAll(
      '[style*="background-image"]'
    );
    elementsWithBg.forEach((el) => {
      const bgImage = el.style.backgroundImage;
      const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (matches && matches[1]) {
        this.assetsToPreload.push({
          type: "image",
          url: matches[1],
          element: el,
        });
      }
    });

    this.totalAssets = this.assetsToPreload.length;
  }

  preloadAsset(asset) {
    return new Promise((resolve) => {
      if (asset.type === "image") {
        const img = new Image();
        img.onload = () => {
          this.loadedAssets++;
          this.updatePreloadProgress();
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
        img.src = asset.url;
      } else if (asset.type === "video-coordinate") {
        // Coordinate with VideoLoader instead of creating duplicate video
        this.preloadVideoWithCoordination(asset.element).then(() => {
          this.loadedAssets++;
          this.updatePreloadProgress();
          resolve();
        });
      }
    });
  }

  async preloadVideoWithCoordination(videoElement) {
    return new Promise((resolve) => {
      // Force VideoLoader to load this hero video immediately (bypass lazy loading)
      const source = videoElement.querySelector(
        "source[data-src], source[data-src-mobile]"
      );
      if (!source) {
        resolve();
        return;
      }

      const isMobile = window.innerWidth <= 992;
      const url =
        isMobile && source.dataset.srcMobile
          ? source.dataset.srcMobile
          : source.dataset.src;

      if (!url) {
        resolve();
        return;
      }

      // Set the source immediately (bypass VideoLoader lazy loading for hero videos)
      if (!source.getAttribute("src")) {
        source.setAttribute("src", url);
      }

      // Create a minimal VideoLoader instance to ensure WebGL coordination works
      if (!videoElement._videoLoaderInstance) {
        // Import VideoLoader and create instance
        import("@modules/VideoLoader.js").then(({ default: VideoLoader }) => {
          new VideoLoader(videoElement, null, {
            lazyLoad: false,
          });
        });
      }

      // Set optimal preload behavior
      if (isMobile) {
        videoElement.preload = "metadata";
      } else {
        videoElement.preload = "auto";
      }

      // Force load
      videoElement.load();

      // Listen for metadata loaded
      const onLoaded = () => resolve();
      const onError = () => resolve();

      videoElement.addEventListener("loadedmetadata", onLoaded, { once: true });
      videoElement.addEventListener("error", onError, { once: true });

      // Timeout fallback
      setTimeout(resolve, 2000);
    });
  }

  updatePreloadProgress() {
    if (this.totalAssets === 0) return;

    // Calculate preload progress for internal tracking only
    this.preloadProgress = Math.round(
      (this.loadedAssets / this.totalAssets) * 70
    );

    // Don't update visual progress - keep it purely fake/smooth
  }

  async load() {
    // Wait for preloading to complete if it hasn't already
    if (!this.preloadComplete) {
      await new Promise((resolve) => {
        const checkComplete = () => {
          if (this.preloadComplete) {
            resolve();
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        checkComplete();
      });
    }

    await this.toLoad(this.main, this.app);
  }
}
