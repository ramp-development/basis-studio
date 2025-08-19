import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default class Enter {
  constructor(data, checkPages, app) {
    this.app = app;
    this.container = data.next.container;
    this.checkPages = checkPages;
    this.data = data;
    this.loader = document.querySelector(".loader");
    this.once = false;
    gsap.set(this.loader, { "--clip": 0, "--leftClip": 0, "--bottomClip": 0 });

    this.tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.8, ease: "power2.inOut" },
    });

    this.app.enterPage = this;

    this.tl.to(this.loader, {
      "--clip": 100,
      onComplete: () => this.complete(),
    });
    // Don't play loader animation immediately - wait for modules to be ready
    this.start();
  }

  complete() {
    this.loader.classList.add("hidden");
  }

  start() {
    gsap.set(this.container, { autoAlpha: 1 });

    document.documentElement.style.scrollBehavior = "instant";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.style.scrollBehavior = "";
      });
    });

    // setTimeout(async () =>
    // {

    // }, 200)

    if (window.innerWidth > 992) {
      this.app.gl.loadWorld(this.container);

      this.app.on("loadedWorld", async () => {
        if (this.once) return;

        this.checkPages(this.app, this.container);
        await this.app.moduleLoader.loadModules(this.container);
        
        // Small delay to ensure all initial states are set
        await new Promise(resolve => setTimeout(resolve, 50));

        this.app.scroll.init();
        this.app.scroll.lenis.on("scroll", (e) => this.app.gl.setScroll(e));
        this.tl.play();

        this.once = true;
      });
    } else {
      (async () => {
        this.checkPages(this.app, this.container);
        await this.app.moduleLoader.loadModules(this.container);
      
      // Small delay to ensure all initial states are set
      await new Promise(resolve => setTimeout(resolve, 50));

        this.app.scroll.init();
        this.app.scroll.lenis.on("scroll", (e) => this.app.gl.setScroll(e));
        this.tl.play();
      })();
    }

    ScrollTrigger.refresh();
  }
}
