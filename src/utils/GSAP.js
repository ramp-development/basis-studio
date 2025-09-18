// GSAP will be loaded from CDN in Webflow
// Access GSAP from window globals
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const SplitText = window.SplitText;
const Flip = window.Flip;

const def = {
  duration: 0.8,
  ease: "power3",
  stagger: 0.05,
};

gsap.defaults(def);

export { gsap, ScrollTrigger, Flip, SplitText, def };
