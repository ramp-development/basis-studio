import LinkAnimation from "@utils/LinkAnimation.js";

export default class Nav {
  constructor(app) {
    this.app = app;

    this.instance = document.querySelector("nav");
    this.top = this.instance.querySelector(".nav_top");
    this.items = this.instance.querySelectorAll(".nav_item");
    this.navDots = this.instance.querySelector(".nav_dots");
    this.navLogo = this.instance.querySelector(".nav_logo");

    this.items.forEach((item, index) => {
      const delay = 0.05 * index + 0.1;
      item.style.setProperty("--delay", `${delay}s`);

      new LinkAnimation(item, this.app);
    });

    this.setupEventListeners();

    this.resize();
    this.app.on("resize", () => this.resize());
  }

  setupEventListeners() {
    this.top.addEventListener("click", (e) => {
      if (window.innerWidth >= 991) return;

      if (this.navLogo && this.navLogo.contains(e.target)) return;

      this.toggleMenu();
    });

    this.navDots.addEventListener("click", () => {
      this.toggleMenu();
    });

    this.setupClickOutside();
  }

  toggleMenu() {
    if (this.instance.classList.contains("active")) {
      this.instance.classList.remove("active");
    } else {
      this.instance.classList.add("active");
    }
  }

  setupClickOutside() {
    document.addEventListener("click", (e) => {
      if (
        !this.instance.classList.contains("active") ||
        window.innerWidth >= 991
      )
        return;

      if (this.instance.contains(e.target)) return;

      this.instance.classList.remove("active");
    });
  }

  resize() {
    const height = this.top.offsetHeight;
    this.instance.style.setProperty("--topHeight", `${height}px`);
  }
}
