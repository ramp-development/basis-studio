import { gsap, SplitText } from "gsap/all";
import { def } from "@utils/GSAP.js";

gsap.registerPlugin(SplitText);

export default class Loader {
    constructor(main, app) {
        this.main = main;
        this.app = app;

        this.hero = this.main.querySelector('.inner-hero');
        this.title = this.hero.querySelector('h1');

        this.titleSplit = new SplitText(this.title, { type: "lines" });
        this.titleSplitSecond = new SplitText(this.title, {
            type: "lines",
            linesClass: "line-second",
        });
        gsap.set(this.titleSplitSecond.lines, {
            overflow: "clip",
            paddingBottom: "0.1em",
            marginBottom: "-0.1em",
            perspective: 1000,
        });

        this.destroyed = false;

        this.init();
        this.app.on('resize', () => this.resize());
        this.app.on('destroy', () => this.destroy());
    }

    init() {
        this.tl = gsap.timeline({
            defaults: { ease: def.ease, duration: 1.4 },
            onComplete: () => {
                this.titleSplit.revert();
            },
        });

        this.tl
            .fromTo(
                this.titleSplit.lines,
                { y: "120%" },
                { y: "0%", stagger: 0.1, ease: "power3", stagger: 0.1 },
                0.8
            )
            .fromTo(
                this.titleSplit.lines,
                {
                    rotateX: "-35deg",
                    rotateY: "-5deg",
                    z: "-1rem",
                    transformStyle: "preserve-3d",
                    transformOrigin: "50% 0",
                },
                {
                    rotateX: "0deg",
                    rotateY: "0deg",
                    z: "0rem",
                    stagger: 0.1,
                    ease: "power2",
                    stagger: 0.1,
                },
                "<"
            );
    }

    resize() {
        if (this.destroyed) return;

        this.titleSplit?.revert();
    }

    destroy() {
        if (this.destroyed) return;

        this.destroyed = true;

        this.tl?.kill();
    }
}