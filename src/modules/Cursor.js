export default class Cursor {
  constructor(instance, app, main) {
    this.instance = instance;
    this.app = app;
    this.main = main;
    this.app.cursor = this;

    this.instance.classList.add("loaded");

    this.destroyed = false;
    this.cursor = this.instance.querySelector(".cursor");
    this.cursorText = this.instance.querySelector(".heading_span");

    this.triggers = this.main.querySelectorAll("[data-cursor-trigger]");
    this.lastTrigger = null;

    this.quicks = {
      x: gsap.quickTo(this.cursor, "x", { duration: 0.3, ease: "power2" }),
      y: gsap.quickTo(this.cursor, "y", { duration: 0.3, ease: "power2" }),
    };

    window.addEventListener("mousemove", (e) => {
      if (this.destroyed) return;

      const size = this.cursor.getBoundingClientRect().width / 2;

      const cursor = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };

      const remapedX = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0.9, 1.0, 0, 1, Math.abs(cursor.x))
      );
      const remapedY = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0.9, 1.0, 0, 1, Math.abs(cursor.y))
      );

      let x = (cursor.x * window.innerWidth) / 2;
      cursor.x < 0 ? (x += size * remapedX) : (x -= size * remapedX);
      let y = (cursor.y * window.innerHeight) / 2;
      cursor.y < 0 ? (y += size * remapedY) : (y -= size * remapedY);

      this.quicks.x(x);
      this.quicks.y(y);
    });

    this.tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        if (this.lastTrigger.dataset.cursorTrigger === "Scroll") {
          this.cursor.classList.remove("stroke");
        }
      },
    });
    this.tl.fromTo(
      this.cursor,
      { scale: 0 },
      { scale: 1, duration: 0.4, ease: "power2" }
    );

    this.triggers.forEach((trigger) => {
      const text = trigger.getAttribute("data-cursor-trigger");

      trigger.addEventListener("mouseenter", () => {
        if (trigger.dataset.cursorTrigger === "Scroll") {
          this.cursor.classList.add("stroke");
        }

        this.tl.play();
        this.cursorText.textContent =
          trigger.dataset.cursorTrigger === "Scroll Text" ? "Scroll" : text;

        this.lastTrigger = trigger;
      });

      trigger.addEventListener("mouseleave", () => {
        this.tl.reverse();
      });
    });

    this.app.on("destroy", () => this.destroy());
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
