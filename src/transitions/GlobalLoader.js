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
    this.loaderLogoSecond = this.loaderLayer[1].querySelector(".loader_logo");
    this.loaderBasisLarge = this.loader.querySelector(".loader_basis_large");
    this.progress = { value: 0 };
    if (this.loaderLogo) gsap.set(this.loaderLogo, { autoAlpha: 0 });
    if (this.loaderLogoSecond)
      gsap.set(this.loaderLogoSecond, { autoAlpha: 0 });

    gsap.to([this.main], { autoAlpha: 1 });

    // Hide small loader logo and nav initially
    gsap.set(this.nav, { autoAlpha: 0 });

    this.tl = gsap.timeline({
      defaults: { ease: "power2", duration: 1 },
      paused: true,
      onComplete: () => this.animateToNav(),
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
      );
    // No clip animation here - will be handled in animateToNav

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
    await this.toLoad(this.main, this.app);
  }

  animateToNav() {
    if (!this.loaderBasisLarge) {
      // Fallback to original behavior if no large logo
      this.loader.classList.add("loaded");
      this.loader.classList.add("hidden");
      gsap.to(this.nav, { autoAlpha: 1 });
      return;
    }

    // Get nav logo position and size
    const navRect = this.navLogo.getBoundingClientRect();
    const currentRect = this.loaderBasisLarge.getBoundingClientRect();

    // Calculate transform values to move from center to nav position
    const translateX =
      navRect.left +
      navRect.width / 2 -
      (currentRect.left + currentRect.width / 2);
    const translateY =
      navRect.top +
      navRect.height / 2 -
      (currentRect.top + currentRect.height / 2);
    const scaleRatio = navRect.width / currentRect.width;

    // Create animation timeline
    const finishTl = gsap.timeline({
      onComplete: () => {
        this.loader.classList.add("loaded");
        this.loader.classList.add("hidden");
        // Reset large logo for next time
        gsap.set(this.loaderBasisLarge, {
          x: 0,
          y: 0,
          scale: 1,
          color: "white",
        });
      },
    });

    finishTl
      // Animate large logo to nav position
      .to(
        this.loaderBasisLarge,
        {
          x: translateX,
          y: translateY,
          scale: scaleRatio,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0
      )
      // Change color from black to white near the end
      .to(
        this.loaderBasisLarge,
        {
          color: "white",
          duration: 0.1,
          ease: "none",
        },
        0.65
      )
      // Show nav earlier so logo can "land" on it
      .to(
        this.nav,
        {
          autoAlpha: 1,
          duration: 0.1,
          ease: "none",
        },
        0.5
      )
      // Simultaneously animate clip reveal
      .fromTo(
        this.loader,
        { "--clip": 0 },
        { "--clip": 100, duration: 0.8, ease: "power2.inOut" },
        0.3
      );
  }
}
