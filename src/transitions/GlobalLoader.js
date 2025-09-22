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

    this.tl = gsap.timeline({
      defaults: { ease: "power2", duration: 1 },
      paused: true,
      onComplete: () => {
        this.loader.classList.add("loaded");
        this.loader.classList.add("hidden");
        gsap.to(this.nav, { autoAlpha: 1 });
        this.app.onceLoaded = true;
      },
    });

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

    this.tl.tweenTo("start");
  }

  updateTextProgress() {
    const value = Math.round(this.progress.value);

    this.loaderText.forEach((text) => {
      text.textContent = value + "%";
    });

    this.loaderLayer[1].style.setProperty("--clip", this.progress.value);
  }

  async load() {
    gsap.to([this.main], { autoAlpha: 1 });
    await this.toLoad(this.main, this.app);
  }
}
