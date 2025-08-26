import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default class Leave {
  constructor(data, done, app) {
    this.app = app;
    this.container = data.current.container;
    this.scroll = this.app.scroll.lenis;

    this.loader = document.querySelector(".loader");
    this.loader.classList.remove("hidden");
    this.nav = document.querySelector(".nav");
    this.nav.classList.remove("active");

    gsap.set(this.loader, {
      "--clip": 0,
      "--leftClip": 100,
      "--bottomClip": 0,
    });

    this.scroll.stop();

    gsap.to(this.loader, {
      "--leftClip": 0,
      onComplete: () => {
        this.app.trigger("destroy");
        this.app.gl.loaded = false;

        ScrollTrigger.killAll();
        done();

        this.app.onceLoaded = true;

        this.app.scroll.destroy();
        window.scrollTo(0, 0);
      },
    });
  }
}
