export default class PageScrollProgress {
  constructor(main, app) {
    this.main = main;
    this.app = app;

    this.destroyed = false;

    this.nav = document.querySelector("nav.nav");
    this.nav.style.setProperty("--progress", 0);

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    this.scroll = ScrollTrigger.create({
      trigger: this.main,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) =>
        this.nav.style.setProperty("--progress", self.progress),
    });
  }

  resize() {
    if (this.destroyed) return;

    this.scroll?.kill();
    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
