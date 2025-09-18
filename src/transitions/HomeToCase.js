export default class HomeToCase {
  constructor(data, done, checkPages, app) {
    this.app = app;
    this.data = data;
    this.checkPages = checkPages;
    this.done = done;
    this.container = data.next.container;
    this.scroll = this.app.scroll.lenis;

    this.loader = document.querySelector(".loader");
    this.nav = document.querySelector(".nav");
    this.loaderLayers = this.loader.querySelectorAll(".loader_layer");
    this.loaderLogo = this.loader.querySelector(".loader_logo");

    this.init();
  }

  init() {
    // Stop scroll and prepare loader
    this.scroll.stop();
    this.loader.classList.remove("hidden");
    this.nav.classList.remove("active");

    // Show large BASIS SVG and hide small logos for case transition
    if (this.loaderLogo) this.loaderLogo.style.opacity = "0";

    // Also hide B logo from both layers to be sure
    const allLoaderLogos = this.loader.querySelectorAll(".loader_logo");
    allLoaderLogos.forEach((logo) => (logo.style.opacity = "0"));

    this.createBasisText();

    // Mirror normal Leave.js but with bottom transition and grey background
    this.loader.classList.add("bottom-transition");

    // Change layer 2 background to grey for case transition
    const layer2Background = this.loader.querySelector(
      ".loader_layer:nth-child(2) .loader_layer-bg"
    );
    if (layer2Background) {
      layer2Background.style.backgroundColor = "var(--color--dark-grey)";
    }

    gsap.set(this.loader, {
      "--topClip": 0,
      "--bottomClip": 100,
      "--clip": 0,
      "--leftClip": 0,
    });

    // Animate from bottom to top (bottomClip 100→0, like normal leftClip 100→0)
    // Also animate SVG from y: 120 to y: 0
    const basisSvg = this.loader.querySelector(".loader_basis_svg");

    gsap.to(this.loader, {
      "--bottomClip": 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => this.leave(),
    });

    if (basisSvg) {
      gsap.to(basisSvg, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }

  createBasisText() {
    // Create BASIS SVG element if it doesn't exist
    if (!this.loader.querySelector(".loader_basis_svg")) {
      // Create wrapper with overflow hidden
      const basisWrapper = document.createElement("div");
      basisWrapper.className = "loader_basis_wrapper";

      const basisSvg = document.createElement("div");
      basisSvg.className = "loader_basis_svg";
      basisSvg.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 117 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0.747025H20.1784C23.5559 0.747025 25.2879 2.33664 25.2879 4.98601C25.2879 6.84056 24.4219 8.16524 22.863 8.6068C24.5951 9.04836 25.4611 10.2847 25.4611 12.1393C25.4611 14.7886 23.7291 16.5549 20.1784 16.5549H0V0.747025ZM19.2257 6.66394C20.0918 6.66394 20.3516 6.31069 20.3516 5.6925C20.3516 5.07432 20.0918 4.72107 19.2257 4.72107H4.93634V6.66394H19.2257ZM19.3989 12.4925C20.265 12.4925 20.5248 12.1393 20.5248 11.5211C20.5248 10.9029 20.265 10.5497 19.3989 10.5497H4.93634V12.4925H19.3989Z" fill="#FFFFFF"></path>
          <path d="M36.8932 0.747025H44.4276L56.1189 16.4666H50.2299L47.4587 12.7575H33.6023L30.831 16.4666H25.1152L36.8932 0.747025ZM44.6874 8.96005L40.4439 3.21976L36.2003 8.96005H44.6874Z" fill="#FFFFFF"></path>
          <path d="M55.5977 11.4339H60.967C61.1402 12.2287 61.833 12.5819 62.5259 12.5819H75.6894C76.5555 12.5819 76.8153 12.2287 76.8153 11.6988C76.8153 11.1689 76.4689 10.8157 75.6894 10.8157L61.3134 10.6391C57.8493 10.5508 55.6843 8.6962 55.6843 5.7819C55.6843 2.8676 57.8493 0.836426 61.4 0.836426H75.4296C79.1535 0.836426 81.5784 3.04423 81.7516 5.87022H76.2956C76.209 5.07541 75.5162 4.81047 74.91 4.81047H62.1794C61.4 4.81047 60.967 5.16372 60.967 5.69359C60.967 6.22346 61.4 6.57671 62.1794 6.57671L76.6421 6.84165C80.1928 6.92996 82.1846 8.78451 82.1846 11.6988C82.1846 14.5248 80.1928 16.6443 76.5555 16.6443H62.1794C58.3689 16.4677 55.7709 14.3482 55.5977 11.4339Z" fill="#FFFFFF"></path>
          <path d="M83.4854 0.747025H88.5949V16.4666H83.4854V0.747025Z" fill="#FFFFFF"></path>
          <path d="M90.5 11.4328H95.8693C96.0426 12.2276 96.7354 12.5809 97.4282 12.5809H110.592C111.458 12.5809 111.718 12.2276 111.718 11.6978C111.718 11.1679 111.371 10.8147 110.592 10.8147L96.1292 10.5497C92.6651 10.4614 90.5 8.60685 90.5 5.69255C90.5 2.77825 92.6651 0.74707 96.2158 0.74707H110.245C113.969 0.74707 116.394 2.95487 116.567 5.78086H111.111C111.025 4.98605 110.332 4.72112 109.726 4.72112H96.9952C96.2158 4.72112 95.7827 5.07436 95.7827 5.60424C95.7827 6.13411 96.2158 6.48736 96.9952 6.48736L111.458 6.75229C115.008 6.84061 117 8.69516 117 11.6095C117 14.4354 115.008 16.5549 111.371 16.5549H96.9952C93.1847 16.4666 90.5866 14.3471 90.5 11.4328Z" fill="#FFFFFF"></path>
        </svg>
      `;

      const isMobile = window.innerWidth <= 992;

      // Style the wrapper with overflow hidden
      basisWrapper.style.cssText = `
                position: absolute;
                ${isMobile ? "top: 90%; left: 50%; transform: translate(-50%, -50%);" : "bottom: 2rem; left: 50%; transform: translateX(-50%);"}
                width: 90vw;
                height: auto;
                z-index: 10;
                aspect-ratio: 117 / 17;
                overflow: hidden;
            `;

      // Style the SVG - initially positioned at y: 120px for animation
      basisSvg.style.cssText = `
                width: 100%;
                height: 100%;
                transform: translateY(-120%);
            `;

      // Put SVG inside wrapper
      basisWrapper.appendChild(basisSvg);

      // Only add to layer 2 (black background + white logo)
      this.loaderLayers[1].appendChild(basisWrapper.cloneNode(true));
    }
  }

  leave() {
    // Trigger destroy and proceed to enter phase
    this.app.trigger("destroy");
    this.app.gl.loaded = false;

    ScrollTrigger.killAll();
    this.done();

    this.app.onceLoaded = true;
    this.app.scroll.destroy();
    window.scrollTo(0, 0);

    // Start enter phase
    this.enter();
  }

  enter() {
    gsap.set(this.container, { autoAlpha: 1 });
    // Mirror normal Enter.js but with bottom transition
    this.loader.classList.add("bottom-transition");
    gsap.set(this.loader, {
      "--topClip": 0,
      "--bottomClip": 0,
      "--clip": 0,
      "--leftClip": 0,
    });

    // Keep B logo hidden during enter phase
    if (this.loaderLogo) this.loaderLogo.style.opacity = "0";

    // Reset scroll position
    document.documentElement.style.scrollBehavior = "instant";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.style.scrollBehavior = "";
      });
    });

    // Load page content
    // Reset SVG position for enter animation (y: 120 → y: 0)
    const basisSvg = this.loader.querySelector(".loader_basis_svg");
    if (basisSvg) {
      gsap.set(basisSvg, { y: -120 });
    }

    if (window.innerWidth > 992) {
      this.app.gl.loadWorld(this.container);
      this.app.on("loadedWorld", () => this.complete());
    } else {
      this.complete();
    }
  }

  async complete() {
    this.checkPages(this.app, this.container);
    await this.app.moduleLoader.loadModules(this.container);

    // Small delay to ensure all initial states are set
    await new Promise((resolve) => setTimeout(resolve, 50));

    this.app.scroll.init();
    this.app.scroll.lenis.on("scroll", (e) => this.app.gl.setScroll(e));

    // Mirror normal Enter.js: animate topClip 0→100 (like normal clip 0→100)
    // Also animate SVG from y: 120 to y: 0 (entrance), then y: 0 to y: -120 (exit)
    const basisSvg = this.loader.querySelector(".loader_basis_svg");

    // First animate SVG entrance: y: 120 → y: 0
    if (basisSvg) {
      gsap.to(basisSvg, {
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.2, // Small delay after clip starts
      });
    }

    // Add longer delay to hold on black background + BASIS SVG before revealing content
    gsap.to(this.loader, {
      "--topClip": 100,
      duration: 0.8,
      ease: "power2.inOut",
      delay: 1.0, // Hold black background + SVG for 1 second before revealing
      onComplete: () => {
        this.loader.classList.add("hidden");
        // Remove bottom transition class and reset variables
        this.loader.classList.remove("bottom-transition");
        gsap.set(this.loader, {
          "--clip": 0,
          "--leftClip": 0,
          "--topClip": 0,
          "--bottomClip": 0,
        });
        // Restore logo and hide BASIS text
        if (this.loaderLogo) this.loaderLogo.style.opacity = "1";

        // Restore all B logos
        const allLoaderLogos = this.loader.querySelectorAll(".loader_logo");
        allLoaderLogos.forEach((logo) => (logo.style.opacity = "1"));

        const basisWrappers = this.loader.querySelectorAll(
          ".loader_basis_wrapper"
        );
        basisWrappers.forEach((wrapper) => wrapper.remove());

        // Restore layer 2 background to black (original color)
        const layer2Background = this.loader.querySelector(
          ".loader_layer:nth-child(2) .loader_layer-bg"
        );
        if (layer2Background) {
          layer2Background.style.backgroundColor = "var(--color--black)";
        }

        // Refresh ScrollTrigger after transition completes
        setTimeout(() => ScrollTrigger.refresh(), 100);
      },
    });

    if (basisSvg) {
      gsap.to(basisSvg, {
        yPercent: 120,
        duration: 0.8,
        delay: 1.0,
        ease: "power2.inOut",
      });
    }
  }
}
