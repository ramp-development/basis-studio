export default class Hero {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    this.hero = this.main.querySelector(".hero");
    this.images = this.hero.querySelectorAll(".hero_image, .hero_video");
    this.videos = this.hero.querySelectorAll(".hero_video video");
    this.button = this.hero.querySelector(".hero_button");

    this.destroyed = false;
    this.mouseEnabled = false; // Disable mouse interactions initially

    this.quicks = [...this.images].map((image, index) => {
      if (window.innerWidth < 992) return;

      // Slower animations for better Safari performance
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const x = gsap.quickTo(image, "x", {
        duration: isSafari ? 0.7 : 0.5,
        ease: "power2.out",
        onUpdate: () => {
          if (index !== 0 || this.destroyed) return;

          if (this.app.gl?.world?.hero?.setPosition) {
            this.app.gl.world.hero.setPosition();
          }
        },
      });
      const y = gsap.quickTo(image, "y", {
        duration: isSafari ? 0.7 : 0.5,
        ease: "power2.out",
      });

      const random = gsap.utils.random(0.8, 1.2, 0.1);

      return { x, y, random };
    });

    this.main.addEventListener("mousemove", (e) => this.mouseMove(e));

    // Play videos once home animation is static
    this.app.on("homeAnimationStatic", () => {
      this.playHeroVideos();
    });

    // Enable mouse interactions after home animation completes
    this.app.on("homeAnimationComplete", () => {
      this.mouseEnabled = true;
    });

    // Add click handler for hero button
    if (this.button) {
      this.button.addEventListener("click", (e) => this.handleButtonClick(e));
    }

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  mouseMove(e) {
    if (this.destroyed || !this.mouseEnabled) return;
    if (window.innerWidth < 992) return;

    // Throttle mouse moves on Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      const now = Date.now();
      if (!this.lastMouseMove) this.lastMouseMove = now;
      if (now - this.lastMouseMove < 32) return; // ~30fps on Safari
      this.lastMouseMove = now;
    }

    const mouse = {
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    };
    const distanceX = window.innerWidth * 0.2;
    const distanceY = window.innerHeight * 0.15;

    this.quicks.forEach((quick) => {
      const x = mouse.x * distanceX * quick.random;
      const y = mouse.y * distanceY * quick.random;

      quick.x(x * -1);
      quick.y(y * -1);
    });
  }

  playHeroVideos() {
    this.videos.forEach((video) => {
      const instance = video._videoLoaderInstance;
      if (instance) instance.playVideo();
    });
  }

  init() {}

  handleButtonClick(e) {
    e.preventDefault();
    const target = document.querySelector("#work_with");

    this.app.scroll.lenis.scrollTo(target, {
      offset: window.innerHeight * 0.35,
      lerp: 0.1,
      duration: 1.5,
      immediate: false,
      lock: false,
      force: false,
    });
  }

  resize() {
    if (this.destroyed) return;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
