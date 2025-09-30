import App from "@app";
const app = App.getInstance();

export default class Leave {
  constructor(data, done) {
    this.container = data.current.container;
    this.scroll = app.scroll.lenis;

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

    gsap.to([this.container], { autoAlpha: 0 });
    gsap.to(
      this.loader,
      {
        "--leftClip": 0,
        onComplete: () => {
          app.trigger("destroy");
          app.gl.loaded = false;

          ScrollTrigger.killAll();
          done();

          app.onceLoaded = true;

          app.scroll.destroy();
          window.scrollTo(0, 0);
        },
      },
      "<"
    );
  }
}
