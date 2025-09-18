import Lenis from "lenis";
import Tempus from "tempus";
import "lenis/dist/lenis.css";

export default class Scroll {
  constructor() {
    this.init();

    ScrollTrigger.addEventListener("refresh", () => this.lenis.resize());

    this.lenis.on("scroll", ScrollTrigger.update);

    Tempus.add((time) => this.lenis.raf(time));

    gsap.ticker.remove(gsap.updateRoot);
    Tempus.add((time) => gsap.updateRoot(time / 1000));
  }

  init() {
    // Optimize for Safari performance
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.lenis = new Lenis({
      duration: isSafari ? 1.2 : 1.4,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: "vertical", // vertical, horizontal
      gestureDirection: "vertical", // vertical, horizontal, both
      smoothWheel: true,
      syncTouch: false,
      syncTouchLerp: isSafari ? 0.1 : 0.08,
      wheelMultiplier: isSafari ? 1.2 : 1.6,
    });
  }

  destroy() {
    this.lenis.destroy();
  }
}
