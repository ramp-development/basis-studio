import BaseAnimation from "@utils/BaseAnimation.js";

export default class AssetReveal extends BaseAnimation {
  constructor(instance, app) {
    super(instance, app);

    this.init();
  }

  init() {
    gsap.set(this.instance.parentElement, {
      perspective: 1000,
      perspectiveOrigin: "center center",
    });

    gsap.set(this.instance, {
      transformOrigin: "center center",
      transformStyle: "preserve-3d",
    });

    this.tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out", duration: 1 },
    });

    // Mimic the 3D GL reveal effect in 2D
    this.tl.fromTo(
      this.instance,
      {
        autoAlpha: 0,
        rotationZ: -18, // equivalent to uRotate: -0.3
        rotationY: 45, // equivalent to uRotateY: 0.8
        rotationX: -45, // equivalent to uRotateX: -0.8
        scale: 0.4,
      },
      {
        autoAlpha: 1,
        rotationZ: 0,
        rotationY: 0,
        rotationX: 0,
        scale: 1,
      }
    );
  }

  animateIn() {
    if (this.tl && !this.isVisible) {
      this.tl.play();
      super.animateIn(); // Sets this.isVisible = true
    }
  }

  animateOut() {
    if (this.tl && this.isVisible) {
      this.tl.pause(0);
      super.animateOut(); // Sets this.isVisible = false
    }
  }

  destroy() {
    this.tl?.kill();
    super.destroy();
  }
}
