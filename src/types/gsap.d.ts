/// <reference types="@types/gsap" />

declare const gsap: typeof import("gsap").gsap;
declare const ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
declare const SplitText: typeof import("gsap/SplitText").SplitText;
declare const Flip: typeof import("gsap/Flip").Flip;

interface Window {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
  Flip: typeof import("gsap/Flip").Flip;
}
