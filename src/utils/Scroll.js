import Lenis from "lenis";
import Tempus from "tempus";
import { isSafari } from "@utils/isSafari";
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
    // Detect touch capability for mobile optimization
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.lenis = new Lenis({
      duration: isTouchDevice ? 1.0 : (isSafari ? 1.2 : 1.4),
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smoothWheel: !isTouchDevice, // Disable smooth scroll on touch devices for better performance
      syncTouch: false,
      touchMultiplier: isTouchDevice ? 1.0 : 1.0,
      wheelMultiplier: isSafari ? 1.2 : 1.6,
    });
  }

  destroy() {
    this.lenis.destroy();
  }
}
