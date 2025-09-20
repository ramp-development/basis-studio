export default class Button {
  constructor(instance, app) {
    this.instance = instance;
    this.app = app;

    // this.textParent = this.instance.querySelector('.btn_text')
    // this.text = this.textParent.children[0]
    // this.clone = this.text.cloneNode(true)
    // this.textParent.appendChild(this.clone)

    this.destroyed = false;
    this.enterPlayed = false;

    this.init();
    this.app.on("resize", () => this.resize());
    this.app.on("destroy", () => this.destroy());
  }

  init() {
    // this.splitMain = new SplitText(this.text, { type: 'chars' })
    // this.splitCopy = new SplitText(this.clone, { type: 'chars' })

    // this.tl = gsap.timeline({ paused: true, defaults: { ease: def.ease, duration: def.duration, stagger: def.stagger * 0.25 } })

    // this.tl.fromTo(this.splitMain.chars, { yPercent: 0 }, { yPercent: -110 })
    // .fromTo(this.splitCopy.chars, { yPercent: 110 }, { yPercent: 0 }, '<0.1')

    // this.instance.addEventListener('mouseenter', () => this.tl.play())
    // this.instance.addEventListener('mouseleave', () => this.tl.reverse())

    if (this.instance.dataset.scroll == "false") return;

    this.tlEnter = gsap.timeline({
      paused: true,
      defaults: { ease: "power1", duration: 0.8 },
    });
    this.tlEnter.fromTo(
      this.instance,
      { opacity: 0, y: "20%" },
      { y: "0%", opacity: 1 }
    );

    this.scroll = ScrollTrigger.create({
      trigger: this.instance,
      start: "top 80%",
      onEnter: () => this.tlEnter.play(),
    });

    this.srcollBack = ScrollTrigger.create({
      trigger: this.instance,
      start: "top bottom",
      onLeaveBack: () => this.tlEnter.pause(0),
    });
  }

  resize() {
    if (this.destroyed) return;

    this.enterPlayed = false;

    this.tl?.kill();
    this.tlEnter?.kill();
    this.scroll?.kill();
    this.srcollBack?.kill();

    this.init();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
  }
}
